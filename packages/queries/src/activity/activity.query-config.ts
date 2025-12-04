import {
  type QueryFunctionContext,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { type AccountAddresses, type Activity, type CryptoAsset } from '@leather.io/models';
import { type UserSettings, getActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

export type UseActivityQueryOptions<TData = Activity[]> = Omit<
  UseQueryOptions<Activity[], Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

function createActivityKeyParams(account: AccountAddresses) {
  const { id, bitcoin, stacks } = account;
  return [
    id.fingerprint,
    id.accountIndex,
    bitcoin?.taprootDescriptor ?? null,
    bitcoin?.nativeSegwitDescriptor ?? null,
    bitcoin?.zeroIndexNativeSegwitPayerAddress ?? null,
    bitcoin?.zeroIndexTaprootPayerAddress ?? null,
    stacks?.stxAddress ?? null,
  ] as const;
}

export function createActivityQueryKey(account: AccountAddresses, settings: UserSettings) {
  return createServiceQueryKey(
    'activity-service--get-activity',
    createActivityKeyParams(account),
    settings
  );
}

export function createActivityQueryConfig<TData = Activity[]>(
  account: AccountAddresses,
  settings: UserSettings,
  options: UseActivityQueryOptions<TData> = {}
): UseQueryOptions<Activity[], Error, TData, QueryKey> {
  const { queryKeyContext = [], select, ...queryOptions } = options;

  return {
    queryKey: [...createActivityQueryKey(account, settings), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivity(account, signal),
    select,
    ...activityQueryOptions,
    ...queryOptions,
  } as UseQueryOptions<Activity[], Error, TData, QueryKey>;
}

export function createActivityByAssetQueryKey(
  account: AccountAddresses,
  asset: CryptoAsset,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'activity-service--get-activity-by-asset',
    [...createActivityKeyParams(account), asset],
    settings
  );
}

export function createActivityByAssetQueryConfig<TData = Activity[]>(
  account: AccountAddresses,
  asset: CryptoAsset,
  settings: UserSettings,
  options: UseActivityQueryOptions<TData> = {}
): UseQueryOptions<Activity[], Error, TData, QueryKey> {
  const { queryKeyContext = [], select, ...queryOptions } = options;
  return {
    queryKey: [...createActivityByAssetQueryKey(account, asset, settings), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivityByAsset(account, asset, signal),
    select,
    ...activityQueryOptions,
    ...queryOptions,
  } as UseQueryOptions<Activity[], Error, TData, QueryKey>;
}
