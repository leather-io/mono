import { QueryObserverSuccessResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

type AllowedReactQueryConfigOptions = keyof Pick<UseQueryOptions, 'select' | 'initialData'>;

/**
 * @deprecated Do not use, will be completely removed with query refactor
 */
export type AppUseQueryConfig<QueryFnData, Response> = Pick<
  UseQueryOptions<QueryFnData, unknown, Response>,
  AllowedReactQueryConfigOptions
>;

export function isErrorTooManyRequests<TData, TError = unknown>(
  query: UseQueryResult<TData, TError>
) {
  if (query.isError && isAxiosError(query.error)) {
    return query.error.response?.status === 429;
  }
  return false;
}

export function isInitializingData<TData, TError = unknown>(query: UseQueryResult<TData, TError>) {
  return query.isLoading || query.isRefetching;
}

export function isFetchedWithSuccess<TData, TError = unknown>(
  query: UseQueryResult<TData, TError>
): query is QueryObserverSuccessResult<TData, TError> {
  return !query.isError && !query.isLoading && query.data !== undefined;
}
