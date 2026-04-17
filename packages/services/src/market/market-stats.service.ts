import { injectable } from 'inversify';

import type { FungibleAssetId, FungibleCryptoAsset, MarketStats } from '@leather.io/models';

import { FungibleAssetService } from '../assets/fungible-asset.service';
import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { mapPriceEntryToMarketStats } from './market-stats.utils';

@injectable()
export class MarketStatsService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly fungibleAssetService: FungibleAssetService
  ) {}

  async getMarketStats(
    asset: FungibleCryptoAsset,
    signal?: AbortSignal
  ): Promise<MarketStats | null> {
    switch (asset.protocol) {
      case 'nativeBtc':
      case 'nativeStx': {
        const nativeMap = await this.leatherApiClient.fetchNativeTokenPriceMap({ signal });
        const entry = nativeMap[asset.symbol];
        return entry ? mapPriceEntryToMarketStats(entry) : null;
      }
      case 'sip10': {
        const sip10Map = await this.leatherApiClient.fetchSip10PriceMap({ signal });
        const entry = sip10Map[asset.contractId];
        return entry ? mapPriceEntryToMarketStats(entry) : null;
      }
      default:
        return null;
    }
  }

  async getMarketStatsByAssetId(
    assetId: FungibleAssetId,
    signal?: AbortSignal
  ): Promise<MarketStats | null> {
    const asset = await this.fungibleAssetService.getAsset(assetId, signal);
    return this.getMarketStats(asset, signal);
  }
}
