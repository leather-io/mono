import {
  type QueryFunctionContext,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { type ActivityView, createActivityView } from '@leather.io/features';
import { type AccountAddresses, type Activity, type CryptoAsset } from '@leather.io/models';
import { type UserSettings, getActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

export type UseActivityQueryOptions<TData = ActivityView[]> = Omit<
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

export function defaultSelect(activity: Activity[], settings: UserSettings): ActivityView[] {
  return activity.map(item => createActivityView(item, settings.network));
}

export function createActivityQueryConfig<TData = ActivityView[]>(
  account: AccountAddresses,
  settings: UserSettings,
  options: UseActivityQueryOptions<TData> = {}
): UseQueryOptions<Activity[], Error, TData, QueryKey> {
  const { queryKeyContext = [], select, ...queryOptions } = options;

  return {
    queryKey: [...createActivityQueryKey(account, settings), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivity(account, signal),
    select: select ?? (activity => defaultSelect(activity, settings)),
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

export function createActivityByAssetQueryConfig<TData = ActivityView[]>(
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
    select: select ?? (activity => defaultSelect(activity, settings)),
    ...activityQueryOptions,
    ...queryOptions,
  } as UseQueryOptions<Activity[], Error, TData, QueryKey>;
}
