import { QueryFunctionContext, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

import { type AccountAddresses, type OnChainActivity } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export type UseAccountActivityQueryOptions = Omit<
  UseQueryOptions<OnChainActivity[], Error, OnChainActivity[], QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

export function getAccountActivityQueryKey(account: AccountAddresses) {
  const { id, bitcoin, stacks } = account;
  return [
    id.fingerprint,
    id.accountIndex,
    bitcoin?.taprootDescriptor ?? null,
    bitcoin?.nativeSegwitDescriptor ?? null,
    bitcoin?.zeroIndexNativeSegwitPayerAddress ?? null,
    bitcoin?.zeroIndexTaprootPayerAddress ?? null,
    stacks?.stxAddress ?? null,
  ];
}

export function getAccountActivityQueryConfig(
  account: AccountAddresses,
  options: UseAccountActivityQueryOptions = {}
): UseQueryOptions<OnChainActivity[], Error, OnChainActivity[], QueryKey> {
  const { queryKeyContext = [], ...queryOptions } = options;
  return {
    queryKey: [
      'activity-service-get-account-activity',
      ...getAccountActivityQueryKey(account),
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getAccountActivity(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 5000,
    gcTime: 5000,
    ...queryOptions,
  } satisfies UseQueryOptions<OnChainActivity[], Error, OnChainActivity[], QueryKey>;
}
