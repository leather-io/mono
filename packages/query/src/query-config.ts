import { QueryObserverSuccessResult, UseQueryResult } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export function isErrorTooManyRequests<TData, TError = unknown>(
  query: UseQueryResult<TData, TError>
) {
  if (query.isError && isAxiosError(query.error)) {
    return query.error.response?.status === 429;
  }
  return false;
}

export function isFetchedWithSuccess<TData, TError = unknown>(
  query: UseQueryResult<TData, TError>
): query is QueryObserverSuccessResult<TData, TError> {
  return !query.isError && !query.isLoading && query.data !== undefined;
}
