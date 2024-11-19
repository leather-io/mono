import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createStxMarketDataQueryOptions() {
  return {
    queryKey: ['market-data-service-get-stx-market-data'],
    queryFn: ({ signal }: QueryFunctionContext) => getMarketDataService().getStxMarketData(signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}

export function useStxMarketDataQuery() {
  return useQuery(createStxMarketDataQueryOptions());
}
