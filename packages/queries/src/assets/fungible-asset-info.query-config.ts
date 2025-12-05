import type { QueryFunctionContext } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import { type UserSettings, getFungibleAssetInfoService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { marketDataQueryOptions } from '../shared/query-options';

const DEFAULT_LOCALE = 'en';

export function createAssetDescriptionQueryKey(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'fungible-asset-info-service-get-asset-description',
    [asset],
    settings
  );
}

export function createAssetDescriptionQueryConfig(
  asset: FungibleCryptoAsset,
  settings: UserSettings
) {
  return {
    queryKey: createAssetDescriptionQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getFungibleAssetInfoService().getAssetDescription(asset, DEFAULT_LOCALE, signal),
    ...marketDataQueryOptions,
  };
}

