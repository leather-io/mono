import {
  defaultBaseSwapAssets,
  getDefaultTargetSwapAssets,
} from '@/features/swap/swap-state/test-utils/fixtures';

import { CryptoAssetId, MarketData } from '@leather.io/models';
import { AccountSwapAsset, MarketDataService, SwapService } from '@leather.io/services';

export interface StubSwapServiceConfig {
  baseSwapAssets?: AccountSwapAsset[];
  targetSwapAssets?: AccountSwapAsset[];
}

export function createStubSwapService({
  baseSwapAssets,
  targetSwapAssets,
}: StubSwapServiceConfig = {}) {
  return {
    async getAccountBaseSwapAssets(): Promise<AccountSwapAsset[]> {
      return Promise.resolve(baseSwapAssets ?? defaultBaseSwapAssets);
    },

    async getAccountTargetSwapAssets(baseId: CryptoAssetId): Promise<AccountSwapAsset[]> {
      return Promise.resolve(targetSwapAssets ?? getDefaultTargetSwapAssets(baseId));
    },
  } as unknown as SwapService;
}

export interface StubMarketDataServiceConfig {
  marketData?: MarketData;
}

export function createStubMarketDataService({ marketData }: StubMarketDataServiceConfig = {}) {
  return {
    async getMarketData(): Promise<MarketData> {
      if (marketData) {
        return Promise.resolve(marketData);
      }
      throw new Error('Market data not configured in stub');
    },
  } as unknown as MarketDataService;
}
