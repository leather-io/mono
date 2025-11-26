import type { QueryFunctionContext } from '@tanstack/react-query';

import type { FungibleCryptoAsset } from '@leather.io/models';
import { type UserSettings, getMarketDataService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { marketDataQueryOptions } from '../shared/query-options';

export function createMarketDataQueryKey(asset: FungibleCryptoAsset, settings: UserSettings) {
  return createServiceQueryKey('market-data-service--get-market-data', [asset], settings);
}
export function createMarketDataQueryConfig(asset: FungibleCryptoAsset, settings: UserSettings) {
  return {
    queryKey: createMarketDataQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketDataService().getMarketData(asset, signal),
    ...marketDataQueryOptions,
  };
}
