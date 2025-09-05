import { UseQueryOptions } from '@tanstack/react-query';

import { minutesInMs, secondsInMs } from '@leather.io/utils';

export const balanceQueryOptions = {
  refetchOnMount: true,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  staleTime: secondsInMs(10),
  gcTime: minutesInMs(10),
  retry: 1,
} satisfies Partial<UseQueryOptions>;

export const balanceQueryOptionsWithRefetch = {
  ...balanceQueryOptions,
  refetchInterval: secondsInMs(30),
} satisfies Partial<UseQueryOptions>;
