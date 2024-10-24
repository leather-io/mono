import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createBtcMarketDataQueryOptions() {
  return {
    queryKey: ['market-data-service-get-btc-market-data'],
    queryFn: ({ signal }: QueryFunctionContext) => getMarketDataService().getBtcMarketData(signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}

export function useBtcMarketDataQuery() {
  return useQuery(createBtcMarketDataQueryOptions());
}
