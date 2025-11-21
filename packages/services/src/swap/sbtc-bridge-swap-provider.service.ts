/* eslint-disable @typescript-eslint/require-await */
import { injectable } from 'inversify';

import { btcAsset } from '@leather.io/constants';
import {
  type SbtcBridgeSwapQuote,
  SwapExecutionData,
  SwapProviderAsset,
  SwapProviderId,
} from '@leather.io/models';
import { createMoney, getAssetId, isSameAssetId } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  type GetSwapExecutionDataParams,
  GetSwapQuotesParams,
  GetTargetProviderAssetsParams,
  SwapProviderService,
} from './swap-provider.interface';
import { mapToSwapDex } from './swap.utils';

const sbtcAssetIdentifier = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token';

@injectable()
export class SbtcBridgeSwapProviderService implements SwapProviderService {
  providerId: SwapProviderId = 'sbtc-bridge';

  private readonly btcSwapAsset: SwapProviderAsset = {
    providerId: this.providerId,
    providerAssetId: btcAsset.symbol,
    assetId: getAssetId(btcAsset),
  };
  private readonly sbtcSwapAsset: SwapProviderAsset = {
    providerId: this.providerId,
    providerAssetId: sbtcAssetIdentifier,
    assetId: {
      protocol: 'sip10',
      id: sbtcAssetIdentifier,
    },
  };

  constructor(private readonly leatherApiClient: LeatherApiClient) {}

  async getBaseProviderAssets(): Promise<SwapProviderAsset[]> {
    return [this.btcSwapAsset, this.sbtcSwapAsset];
  }

  async getTargetProviderAssets({
    baseProviderAsset,
  }: GetTargetProviderAssetsParams): Promise<SwapProviderAsset[]> {
    if (isSameAssetId(baseProviderAsset.assetId, this.sbtcSwapAsset.assetId)) {
      return [this.btcSwapAsset];
    }
    if (isSameAssetId(baseProviderAsset.assetId, this.btcSwapAsset.assetId)) {
      return [this.sbtcSwapAsset];
    }
    return [];
  }

  async getSwapQuotes({
    baseAsset,
    baseAmount,
    targetAsset,
  }: GetSwapQuotesParams): Promise<SbtcBridgeSwapQuote[]> {
    const swapDexMap = await this.leatherApiClient.fetchSwapDexes();
    return [
      {
        executionType: 'sbtc-bridge-transfer',
        providerId: 'sbtc-bridge',
        baseAsset,
        targetAsset,
        baseAmount,
        targetAmount: createMoney(
          baseAmount.amount.toNumber(),
          targetAsset.symbol,
          targetAsset.decimals
        ),
        dexPath: swapDexMap['sbtc-bridge'] ? [mapToSwapDex(swapDexMap['sbtc-bridge'])] : [],
        assetPath: [baseAsset, targetAsset],
        createdAt: new Date(),
      },
    ];
  }

  async getSwapExecutionData({ quote }: GetSwapExecutionDataParams): Promise<SwapExecutionData> {
    return {
      executionType: 'sbtc-bridge-transfer',
      providerId: this.providerId,
      quote,
    };
  }
}
