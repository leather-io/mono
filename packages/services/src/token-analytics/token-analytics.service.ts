import { injectable } from 'inversify';

import type {
  FungibleAssetId,
  FungibleCryptoAsset,
  TokenAnalytics,
  TokenDistribution,
} from '@leather.io/models';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import {
  mapApiAnalyticsToTokenAnalytics,
  mapApiDistributionToTokenDistribution,
} from './token-analytics.utils';

@injectable()
export class TokenAnalyticsService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getAnalytics(
    asset: FungibleCryptoAsset,
    signal?: AbortSignal
  ): Promise<TokenAnalytics | null> {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx': {
        const map = await this.leatherApiClient.fetchNativeAnalyticsMap({ signal });
        const entry = map[asset.symbol];
        return entry ? mapApiAnalyticsToTokenAnalytics(entry) : null;
      }
      case 'sip10': {
        const map = await this.leatherApiClient.fetchSip10AnalyticsMap({ signal });
        const entry = map[asset.contractId];
        return entry ? mapApiAnalyticsToTokenAnalytics(entry) : null;
      }
      case 'rune': {
        const map = await this.leatherApiClient.fetchRuneAnalyticsMap({ signal });
        const entry = map[asset.runeName];
        return entry ? mapApiAnalyticsToTokenAnalytics(entry) : null;
      }
      default:
        return null;
    }
  }

  async getAnalyticsByAssetId(
    assetId: FungibleAssetId,
    signal?: AbortSignal
  ): Promise<TokenAnalytics | null> {
    const asset = await this.fungibleAssetService.getAsset(assetId, signal);
    return this.getAnalytics(asset, signal);
  }

  async getDistribution(
    asset: FungibleCryptoAsset,
    signal?: AbortSignal
  ): Promise<TokenDistribution | null> {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx': {
        const result = await this.leatherApiClient.fetchNativeDistribution(asset.symbol, {
          signal,
        });
        return result ? mapApiDistributionToTokenDistribution(result) : null;
      }
      case 'sip10': {
        const result = await this.leatherApiClient.fetchSip10Distribution(asset.contractId, {
          signal,
        });
        return result ? mapApiDistributionToTokenDistribution(result) : null;
      }
      case 'rune': {
        const result = await this.leatherApiClient.fetchRuneDistribution(asset.runeName, {
          signal,
        });
        return result ? mapApiDistributionToTokenDistribution(result) : null;
      }
      default:
        return null;
    }
  }

  async getDistributionByAssetId(
    assetId: FungibleAssetId,
    signal?: AbortSignal
  ): Promise<TokenDistribution | null> {
    const asset = await this.fungibleAssetService.getAsset(assetId, signal);
    return this.getDistribution(asset, signal);
  }
}
