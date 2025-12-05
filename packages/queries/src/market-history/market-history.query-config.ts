import type { QueryFunctionContext } from '@tanstack/react-query';

import type { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { type UserSettings, getMarketHistoryService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { marketHistoryQueryOptions } from '../shared/query-options';

export function createPriceChangePercentageQueryKey(
  asset: FungibleCryptoAsset,
  period: HistoricalPeriod | undefined,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'market-history-service-get-price-change-percentage',
    [asset, period],
    settings
  );
}

export function createPriceChangePercentageQueryConfig(
  asset: FungibleCryptoAsset,
  period: HistoricalPeriod | undefined,
  settings: UserSettings
) {
  return {
    queryKey: createPriceChangePercentageQueryKey(asset, period, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketHistoryService().getPriceChangePercentage(asset, period, signal),
    ...marketHistoryQueryOptions,
  };
}

