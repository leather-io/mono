import { useQuery } from '@tanstack/react-query';
import type { TokenInfo } from 'alex-sdk';

import { AppUseQueryConfig } from '../../query-config';
import { alex } from './alex-sdk.hooks';

const queryOptions = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retryDelay: 1000 * 60,
  staleTime: 1000 * 60 * 10,
};

export function useAlexSdkSwappableCurrencyQuery<T extends unknown = TokenInfo[]>(
  options?: AppUseQueryConfig<TokenInfo[], T>
) {
  return useQuery({
    queryKey: ['alex-sdk-swappable-currencies'],
    queryFn: async () => alex.fetchSwappableCurrency(),
    ...queryOptions,
    ...options,
  });
}
