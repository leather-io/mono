import type { QueryFunctionContext } from '@tanstack/react-query';

import type { FungibleAssetId, FungibleCryptoAsset } from '@leather.io/models';
import { type UserSettings, getMarketStatsService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { marketStatsQueryOptions } from '../shared/query-options';

export function createMarketStatsQueryKey(asset: FungibleCryptoAsset, settings: UserSettings) {
  return createServiceQueryKey('market-stats-service--get-market-stats', [asset], settings);
}

export function createMarketStatsQueryConfig(asset: FungibleCryptoAsset, settings: UserSettings) {
  return {
    queryKey: createMarketStatsQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketStatsService().getMarketStats(asset, signal),
    ...marketStatsQueryOptions,
  };
}

export function createMarketStatsByAssetIdQueryKey(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'market-stats-service--get-market-stats-by-asset-id',
    [assetId],
    settings
  );
}

export function createMarketStatsByAssetIdQueryConfig(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return {
    queryKey: createMarketStatsByAssetIdQueryKey(assetId, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketStatsService().getMarketStatsByAssetId(assetId, signal),
    ...marketStatsQueryOptions,
  };
}
