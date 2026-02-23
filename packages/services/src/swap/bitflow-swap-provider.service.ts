import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type BitflowSdkSwapQuote,
  CryptoAssetProtocols,
  FungibleAssetId,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwappableFungibleCryptoAsset,
  isSwappableAsset,
} from '@leather.io/models';
import { convertAmountToBaseUnit, createMoneyFromDecimal, getAssetId } from '@leather.io/utils';

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
  GetSwapExecutionDataParams,
  GetSwapQuotesParams,
  GetTargetProviderAssetsParams,
  SwapProviderService,
} from './swap-provider.interface';
import { mapBitflowDexProviderToSwapDexId, mapToStacksProtocol } from './swap.utils';

@injectable()
export class BitflowSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'bitflow-sdk';

  constructor(
    private readonly bitflowSdkClient: BitflowSdkClient,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getBaseProviderAssets(): Promise<SwapProviderAsset[]> {
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

  async getTargetProviderAssets({
    baseProviderAsset,
  }: GetTargetProviderAssetsParams): Promise<SwapProviderAsset[]> {
    const [swapAssets, tokenYs] = await Promise.all([
      this.getBaseProviderAssets(),
      this.bitflowSdkClient.getAllPossibleTokenY(baseProviderAsset.providerAssetId),
    ]);
    return swapAssets.filter(swapAsset => tokenYs.includes(swapAsset.providerAssetId));
  }

  async getSwapQuotes(
    params: GetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<BitflowSdkSwapQuote[]> {
    const { baseProviderAsset, targetProviderAsset, baseAmount } = params;
    const [quoteResult, swapDexMap] = await Promise.all([
      this.bitflowSdkClient.getQuoteForRoute(
        baseProviderAsset.providerAssetId,
        targetProviderAsset.providerAssetId,
        convertAmountToBaseUnit(baseAmount).toNumber()
      ),
      this.leatherApiClient.fetchSwapDexes(),
    ]);
    if (!quoteResult) return [];

    const quotes = await Promise.all(
      quoteResult.allRoutes
        .filter(route => !!route.quote)
        .map(route => this.mapBitflowRouteToQuote(route, params, swapDexMap, signal))
    );
    return quotes;
  }

  private async mapBitflowRouteToQuote(
    route: BitflowSdkRouteQuote,
    params: GetSwapQuotesParams,
    swapDexMap: Record<string, LeatherApiSwapDex>,
    signal?: AbortSignal
  ): Promise<BitflowSdkSwapQuote> {
    const { baseAsset, targetAsset, baseAmount } = params;
    return {
      baseAsset,
      targetAsset,
      executionType: 'stacks-contract-call',
      providerId: 'bitflow-sdk',
      providerQuoteData: {
        bitflowSdkSelectedSwapRoute: route.route,
      },
      baseAmount,
      targetAmount: createMoneyFromDecimal(route.quote!, targetAsset.symbol, targetAsset.decimals),
      dexPath: route.dexPath
        .map(mapBitflowDexProviderToSwapDexId)
        .map(swapDexId => swapDexMap[swapDexId])
        .filter(isNonNullish)
        .map(mapToStacksProtocol),
      assetPath: await this.getAssetPathAssets(route.tokenPath, signal),
      isExecutable: true,
      executionConstraints: [],
      createdAt: new Date(),
    };
  }

  private async getAssetPathAssets(
    pathKeys: string[],
    signal?: AbortSignal
  ): Promise<SwappableFungibleCryptoAsset[]> {
    const allSwapAssets = await this.getBaseProviderAssets();
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
    slippagePercentage,
  }: GetSwapExecutionDataParams): Promise<SwapExecutionData> {
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
        amount: quote.baseAmount.amount.toNumber(),
      },
      request.account.stacks!.stxAddress,
      slippagePercentage.toNumber()
    );
    if (!swapParams) throw new Error('Bitflow swap params unavailable');

    return {
      providerId: quote.providerId,
      executionType: quote.executionType,
      quote,
      contractAddress: swapParams.contractAddress,
      contractName: swapParams.contractName,
      functionName: swapParams.functionName,
      functionArgs: swapParams.functionArgs,
      postConditions: swapParams.postConditions,
    };
  }
}
