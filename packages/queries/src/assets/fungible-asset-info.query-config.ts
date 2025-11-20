import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import {
  type AssetDescription,
  type UserSettings,
  getFungibleAssetInfoService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createFungibleAssetDescriptionQueryKey(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'fungible-asset-info-service--get-asset-description',
    [asset],
    settings
  );
}

export function createFungibleAssetDescriptionQueryConfig(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return {
    queryKey: createFungibleAssetDescriptionQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getFungibleAssetInfoService().getAssetDescription(asset, 'en', signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 60000,
    gcTime: 60000,
  } satisfies UseQueryOptions<AssetDescription, Error>;
}
