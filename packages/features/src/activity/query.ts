import {
  QueryFunctionContext,
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/react-query';

import { type AccountAddresses, type OnChainActivity } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export type UseAccountActivityQueryOptions = Omit<
  UseQueryOptions<OnChainActivity[], Error, OnChainActivity[], QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

export function useAccountActivityQuery(
  account: AccountAddresses,
  options: UseAccountActivityQueryOptions = {}
) {
  const { queryKeyContext = [], ...queryOptions } = options;
  return useQuery<OnChainActivity[], Error>({
    queryKey: ['activity-service-get-account-activity', account, ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getAccountActivity(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 5000,
    gcTime: 5000,
    ...queryOptions,
  });
}

export function useAccountActivity(
  account: AccountAddresses,
  options?: UseAccountActivityQueryOptions
) {
  return useAccountActivityQuery(account, options);
}
