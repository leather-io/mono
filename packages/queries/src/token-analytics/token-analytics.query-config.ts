import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type {
  FungibleAssetId,
  FungibleCryptoAsset,
  TokenAnalytics,
  TokenDistribution,
} from '@leather.io/models';
import { type UserSettings, getTokenAnalyticsService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { tokenAnalyticsQueryOptions } from '../shared/query-options';

export function createTokenAnalyticsQueryKey(asset: FungibleCryptoAsset, settings: UserSettings) {
  return createServiceQueryKey('token-analytics-service--get-analytics', [asset], settings);
}

export function createTokenAnalyticsQueryConfig(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return {
    queryKey: createTokenAnalyticsQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getTokenAnalyticsService().getAnalytics(asset, signal),
    ...tokenAnalyticsQueryOptions,
  } satisfies UseQueryOptions<TokenAnalytics | null, Error>;
}

export function createTokenAnalyticsByAssetIdQueryKey(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'token-analytics-service--get-analytics-by-asset-id',
    [assetId],
    settings
  );
}

export function createTokenAnalyticsByAssetIdQueryConfig(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return {
    queryKey: createTokenAnalyticsByAssetIdQueryKey(assetId, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getTokenAnalyticsService().getAnalyticsByAssetId(assetId, signal),
    ...tokenAnalyticsQueryOptions,
  } satisfies UseQueryOptions<TokenAnalytics | null, Error>;
}

export function createTokenDistributionQueryKey(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return createServiceQueryKey('token-analytics-service--get-distribution', [asset], settings);
}

export function createTokenDistributionQueryConfig(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return {
    queryKey: createTokenDistributionQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getTokenAnalyticsService().getDistribution(asset, signal),
    ...tokenAnalyticsQueryOptions,
  } satisfies UseQueryOptions<TokenDistribution | null, Error>;
}

export function createTokenDistributionByAssetIdQueryKey(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'token-analytics-service--get-distribution-by-asset-id',
    [assetId],
    settings
  );
}

export function createTokenDistributionByAssetIdQueryConfig(
  assetId: FungibleAssetId,
  settings: UserSettings
) {
  return {
    queryKey: createTokenDistributionByAssetIdQueryKey(assetId, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getTokenAnalyticsService().getDistributionByAssetId(assetId, signal),
    ...tokenAnalyticsQueryOptions,
  } satisfies UseQueryOptions<TokenDistribution | null, Error>;
}
