import { QueryFunctionContext } from '@tanstack/react-query';

import { FungibleCryptoAsset, HistoricalPeriod } from '@leather.io/models';
import { getMarketHistoryService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createPriceChangePercentageQueryOptions(
  asset: FungibleCryptoAsset,
  period: HistoricalPeriod = '1d'
) {
  return {
    queryKey: ['market-history-service-get-price-change-percentage', asset, period],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketHistoryService().getPriceChangePercentage(asset, period, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}
