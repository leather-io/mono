import { injectable } from 'inversify';
import { isNonNullish } from 'remeda';

import { stxAsset } from '@leather.io/constants';
import {
  FungibleAssetId,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
  SwappableFungibleCryptoAsset,
  type VelarSdkSwapQuote,
  isSwappableAsset,
} from '@leather.io/models';
import { createMoney, getAssetId, unitToFractionalUnit } from '@leather.io/utils';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { VelarSdkClient, VelarSdkToken } from '../infrastructure/api/velar/velar-sdk.client';
import {
  SwapProviderService,
  SwapProviderServiceGetSwapExecutionDataParams,
  SwapProviderServiceGetSwapQuotesParams,
  SwapProviderServiceGetTargetAssetParams,
} from './swap-provider.interface';
import { mapToSwapDex } from './swap.utils';

@injectable()
export class VelarSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'velar-sdk';

  constructor(
    private readonly velarClient: VelarSdkClient,
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getBaseSwapAssets(): Promise<SwapProviderAsset[]> {
    const tokens = await this.velarClient.getTokens();
    return tokens.map(token => this.mapTokenToSwapAsset(token));
  }

  async getTargetAssets({
    baseAsset,
  }: SwapProviderServiceGetTargetAssetParams): Promise<SwapProviderAsset[]> {
    const [velarSupportedTokens, velarTargetSymbols] = await Promise.all([
      this.velarClient.getTokens(),
      this.velarClient.getTokenPairs(baseAsset.symbol),
    ]);
    return velarTargetSymbols
      .map(targetSymbol => velarSupportedTokens.find(token => token.symbol === targetSymbol))
      .filter(isNonNullish)
      .map(token => this.mapTokenToSwapAsset(token));
  }

  private mapTokenToSwapAsset(token: VelarSdkToken): SwapProviderAsset {
    return {
      providerId: this.providerId,
      providerAssetId: token.contractAddress,
      assetId:
        token.symbol === stxAsset.symbol
          ? getAssetId(stxAsset)
          : {
              protocol: 'sip10',
              id: `${token.contractAddress}::${token.assetName}`,
            },
    };
  }

  async getSwapQuotes(
    {
      baseAsset,
      baseProviderAsset,
      targetAsset,
      targetProviderAsset,
      baseAmount,
    }: SwapProviderServiceGetSwapQuotesParams,
    signal?: AbortSignal
  ): Promise<VelarSdkSwapQuote[]> {
    try {
      const amountOut = await this.velarClient.getComputedAmount(
        baseProviderAsset.providerAssetId,
        targetProviderAsset.providerAssetId,
        baseAmount
      );

      const [swapDexMap, assetPath] = await Promise.all([
        this.leatherApiClient.fetchSwapDexes({ signal }),
        this.getAssetPathAssets(amountOut.route ?? [], signal),
      ]);

      return [
        {
          executionType: 'stacks-contract-call',
          providerId: 'velar-sdk',
          providerQuoteData: {
            baseProviderAssetId: baseProviderAsset.providerAssetId,
            targetProviderAssetId: targetProviderAsset.providerAssetId,
          },
          baseAmount,
          targetAmount: +amountOut.value,
          quote: createMoney(
            unitToFractionalUnit(targetAsset.decimals)(+amountOut.value).toNumber(),
            targetAsset.symbol,
            targetAsset.decimals
          ),
          dexPath: swapDexMap['velar'] ? [mapToSwapDex(swapDexMap['velar'])] : [],
          assetPath: assetPath.length > 1 ? assetPath : [baseAsset, targetAsset],
        },
      ];
    } catch {
      return [];
    }
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
    if (quote.providerId !== 'velar-sdk') {
      throw new Error('Invalid quote provider id');
    }

    const swapData = await this.velarClient.getSwap(
      request.account.stacks!.stxAddress,
      quote.providerQuoteData.baseProviderAssetId,
      quote.providerQuoteData.targetProviderAssetId,
      quote.baseAmount,
      slippage
    );

    return {
      executionType: quote.executionType,
      providerId: quote.providerId,
      contractAddress: swapData.contractAddress,
      contractName: swapData.contractName,
      functionName: swapData.functionName,
      functionArgs: swapData.functionArgs,
      postConditions: swapData.postConditions,
      postConditionMode: swapData.postConditionMode,
    };
  }
}
