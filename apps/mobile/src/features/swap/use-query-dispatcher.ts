import { useRef } from 'react';

import { UseQueryResult } from '@tanstack/react-query';

interface UseQueryDispatcherOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
  queryKey: unknown[]; // The same queryKey used in useQuery
}

/**
 * Hook that fires callbacks only when a query receives genuinely new data or errors,
 * not on every re-render. Provides parameter-aware tracking to prevent callbacks
 * from firing for stale data when query parameters change.
 *
 * This recreates the onSuccess/onError callback functionality removed in TanStack Query v5.
 */
export function useQueryDispatcher<T>(
  query: UseQueryResult<T, Error>,
  { onSuccess, onError, queryKey }: UseQueryDispatcherOptions<T>
) {
  const lastSeenDataAt = useRef<number>(0);
  const lastSeenErrorAt = useRef<number>(0);
  const currentQueryKey = JSON.stringify(queryKey);
  const lastQueryKey = useRef<string>(currentQueryKey);

  if (
    query.status === 'success' &&
    query.data &&
    query.dataUpdatedAt > lastSeenDataAt.current &&
    currentQueryKey === lastQueryKey.current
  ) {
    lastSeenDataAt.current = query.dataUpdatedAt;
    onSuccess?.(query.data);
  }

  if (
    query.status === 'error' &&
    query.error &&
    (query.errorUpdatedAt ?? 0) > lastSeenErrorAt.current &&
    currentQueryKey === lastQueryKey.current
  ) {
    lastSeenErrorAt.current = query.errorUpdatedAt ?? 0;
    onError?.(query.error);
  }

  if (currentQueryKey !== lastQueryKey.current) {
    lastQueryKey.current = currentQueryKey;
    lastSeenDataAt.current = 0;
    lastSeenErrorAt.current = 0;
  }
}
