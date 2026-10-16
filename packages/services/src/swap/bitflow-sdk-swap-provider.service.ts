import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  type BitflowSdkSwapQuote,
  CryptoAssetProtocols,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwappableFungibleCryptoAsset,
  isSwappableAsset,
} from '@leather.io/models';
import { convertAmountToBaseUnit, createMoneyFromDecimal, getAssetId } from '@leather.io/utils';

import { toFungibleAssetId } from '../assets/fungible-asset-id.utils';
import { FungibleAssetService } from '../assets/fungible-asset.service';
import {
  BitflowSdkClient,
  BitflowSdkRouteQuote,
} from '../infrastructure/api/bitflow/bitflow-sdk.client';
import { bitflowSdkSelectedSwapRouteSchema } from '../infrastructure/api/bitflow/bitflow-sdk.schema';
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
export class BitflowSdkSwapProviderService implements SwapProviderService {
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
      quoteResult.allRoutes.flatMap(route =>
        route.quote
          ? [this.mapBitflowRouteToQuote(route, route.quote, params, swapDexMap, signal)]
          : []
      )
    );
    return quotes;
  }

  private async mapBitflowRouteToQuote(
    route: BitflowSdkRouteQuote,
    routeQuote: number,
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
      targetAmount: createMoneyFromDecimal(routeQuote, targetAsset.symbol, targetAsset.decimals),
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
      .map(a => toFungibleAssetId(a.assetId))
      .filter(isNonNullish)
      .map(assetId => this.fungibleAssetService.getAsset(assetId, signal));
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

    const stxAddress = request.account.stacks?.stxAddress;
    if (!stxAddress) {
      throw new Error('Stacks address required for swap execution');
    }

    const parsedSelectedSwapRoute = bitflowSdkSelectedSwapRouteSchema.safeParse(
      quote.providerQuoteData.bitflowSdkSelectedSwapRoute
    );
    if (!parsedSelectedSwapRoute.success) {
      throw new Error('Invalid Bitflow swap route');
    }
    const selectedSwapRoute = parsedSelectedSwapRoute.data;

    const swapParams = await this.bitflowSdkClient.getSwapParams(
      {
        route: selectedSwapRoute,
        tokenXDecimals: selectedSwapRoute.tokenXDecimals,
        tokenYDecimals: selectedSwapRoute.tokenYDecimals,
        amount: quote.baseAmount.amount.toNumber(),
      },
      stxAddress,
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
