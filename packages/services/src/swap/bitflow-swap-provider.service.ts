import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type BitflowSdkSwapQuote,
  CryptoAssetProtocols,
  FungibleAssetId,
  FungibleCryptoAsset,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwappableFungibleCryptoAsset,
  isSwappableAsset,
} from '@leather.io/models';
import { createMoneyFromDecimal, getAssetId } from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import {
  BitflowSdkClient,
  BitflowSdkRouteQuote,
  type BitflowSdkSelectedSwapRoute,
} from '../infrastructure/api/bitflow/bitflow-sdk.client';
import {
  LeatherApiClient,
  LeatherApiSwapDex,
} from '../infrastructure/api/leather/leather-api.client';
import {
  SwapProviderService,
  SwapProviderServiceGetSwapExecutionDataParams,
  SwapProviderServiceGetSwapQuotesParams,
  SwapProviderServiceGetTargetAssetParams,
} from './swap-provider.interface';
import { mapBitflowDexProviderToSwapDexId, mapToSwapDex } from './swap.utils';

@injectable()
export class BitflowSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'bitflow-sdk';

  constructor(
    private readonly bitflowSdkClient: BitflowSdkClient,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getBaseSwapAssets(): Promise<SwapProviderAsset[]> {
    const tokens = await this.bitflowSdkClient.getAvailableTokens();
    return tokens
      .map(token => {
        if (token.symbol === stxAsset.symbol) {
          return {
            providerId: this.providerId,
            providerAssetId: token.tokenId,
            assetId: getAssetId(stxAsset),
          };
        } else {
          return token.tokenContract
            ? {
                providerId: this.providerId,
                providerAssetId: token.tokenId,
                assetId: {
                  protocol: CryptoAssetProtocols.sip10,
                  id: `${token.tokenContract}::${token.tokenName}`,
                },
              }
            : undefined;
        }
      })
      .filter(isNonNullish);
  }

  async getTargetAssets({
    baseProviderAsset,
  }: SwapProviderServiceGetTargetAssetParams): Promise<SwapProviderAsset[]> {
    const [swapAssets, tokenYs] = await Promise.all([
      this.getBaseSwapAssets(),
      this.bitflowSdkClient.getAllPossibleTokenY(baseProviderAsset.providerAssetId),
    ]);
    return swapAssets.filter(swapAsset => tokenYs.includes(swapAsset.providerAssetId));
  }

  async getSwapQuotes(
    {
      baseProviderAsset,
      targetProviderAsset,
      targetAsset,
      baseAmount,
    }: SwapProviderServiceGetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<BitflowSdkSwapQuote[]> {
    const [quoteResult, swapDexMap] = await Promise.all([
      this.bitflowSdkClient.getQuoteForRoute(
        baseProviderAsset.providerAssetId,
        targetProviderAsset.providerAssetId,
        baseAmount
      ),
      this.leatherApiClient.fetchSwapDexes(),
    ]);
    if (!quoteResult) return [];

    const quotes = await Promise.all(
      quoteResult.allRoutes
        .filter(route => !!route.quote)
        .map(route =>
          this.mapBitflowRouteToQuote(baseAmount, route, targetAsset, swapDexMap, signal)
        )
    );
    return quotes;
  }

  private async mapBitflowRouteToQuote(
    baseAmount: number,
    route: BitflowSdkRouteQuote,
    targetAsset: FungibleCryptoAsset,
    swapDexMap: Record<string, LeatherApiSwapDex>,
    signal?: AbortSignal
  ): Promise<BitflowSdkSwapQuote> {
    return {
      executionType: 'stacks-contract-call',
      providerId: 'bitflow-sdk',
      providerQuoteData: {
        bitflowSdkSelectedSwapRoute: route.route,
      },
      baseAmount,
      targetAmount: route.quote!,
      quote: createMoneyFromDecimal(route.quote!, targetAsset.symbol, targetAsset.decimals),
      dexPath: route.dexPath
        .map(mapBitflowDexProviderToSwapDexId)
        .map(swapDexId => swapDexMap[swapDexId])
        .filter(isNonNullish)
        .map(mapToSwapDex),
      assetPath: await this.getAssetPathAssets(route.tokenPath, signal),
    };
  }

  private async getAssetPathAssets(
    pathKeys: string[],
    signal?: AbortSignal
  ): Promise<SwappableFungibleCryptoAsset[]> {
    const allSwapAssets = await this.getBaseSwapAssets();
    const promises = pathKeys
      .map(key => allSwapAssets.find(a => a.providerAssetId === key))
      .filter(isNonNullish)
      .map(a => this.fungibleAssetService.getAsset(a.assetId as FungibleAssetId, signal));
    const results = await Promise.allSettled(promises);
    return results
      .map(result => (result.status === 'fulfilled' ? result.value : null))
      .filter(isNonNullish)
      .filter(isSwappableAsset);
  }

  async getSwapExecutionData({
    request,
    quote,
    slippage,
  }: SwapProviderServiceGetSwapExecutionDataParams): Promise<SwapExecutionData> {
    if (quote.providerId !== 'bitflow-sdk') {
      throw new Error('Invalid quote provider id');
    }

    const selectedSwapRoute = quote.providerQuoteData
      .bitflowSdkSelectedSwapRoute as BitflowSdkSelectedSwapRoute;

    const swapParams = await this.bitflowSdkClient.getSwapParams(
      {
        route: selectedSwapRoute,
        tokenXDecimals: selectedSwapRoute.tokenXDecimals,
        tokenYDecimals: selectedSwapRoute.tokenYDecimals,
        amount: quote.baseAmount,
      },
      request.account.stacks!.stxAddress,
      slippage
    );
    if (!swapParams) throw new Error('Bitflow swap params unavailable');

    return {
      providerId: quote.providerId,
      executionType: quote.executionType,
      contractAddress: swapParams.contractAddress,
      contractName: swapParams.contractName,
      functionName: swapParams.functionName,
      functionArgs: swapParams.functionArgs,
      postConditions: swapParams.postConditions,
    };
  }
}
