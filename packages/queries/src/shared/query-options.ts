import type { UseQueryOptions } from '@tanstack/react-query';

import { oneMinInMs } from '@leather.io/utils';

/**
 * Standard query options for balance queries.
 * Balances are relatively stable and can be cached for 5 seconds.
 */
export const balanceQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retryOnMount: false,
  staleTime: 5000,
  gcTime: 5000,
} satisfies Partial<UseQueryOptions>;

export const activityQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: 'always',
  retryOnMount: false,
  staleTime: 5000,
  gcTime: 5000,
} satisfies Partial<UseQueryOptions>;

/**
 * Standard query options for market data queries.
 * Market data changes frequently, so we use a 1-minute stale time.
 */
export const marketDataQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retryOnMount: false,
  staleTime: oneMinInMs,
  gcTime: oneMinInMs,
} satisfies Partial<UseQueryOptions>;

export const marketHistoryQueryOptions = {
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retryOnMount: false,
  staleTime: 30000,
  gcTime: 30000,
} satisfies Partial<UseQueryOptions>;
