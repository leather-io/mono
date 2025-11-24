import { QueryKey, UseQueryOptions } from '@tanstack/react-query';

export type BalanceQueryHookOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};
