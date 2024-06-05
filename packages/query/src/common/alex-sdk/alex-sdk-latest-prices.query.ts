import { useQuery } from '@tanstack/react-query';

import { alex } from './alex-sdk.hooks';

export function useAlexSdkLatestPricesQuery() {
  return useQuery(['alex-sdk-latest-prices'], async () => alex.getLatestPrices(), {
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retryDelay: 1000 * 60,
    staleTime: 1000 * 60 * 10,
  });
}
