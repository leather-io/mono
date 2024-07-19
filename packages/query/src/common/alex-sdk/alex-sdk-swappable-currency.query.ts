import { useQuery } from '@tanstack/react-query';

import { alex } from './alex-sdk.hooks';

const queryOptions = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retryDelay: 1000 * 60,
  staleTime: 1000 * 60 * 10,
} as const;

export function createGetAlexSwappableCurrenciesQueryOptions() {
  return {
    queryKey: ['get-alex-sdk-swappable-currencies'],
    queryFn: () => alex.fetchSwappableCurrency(),
    ...queryOptions,
  } as const;
}

export function useGetAlexSwappableCurrenciesQuery() {
  return useQuery(createGetAlexSwappableCurrenciesQueryOptions());
}
