import {
  type QueryFunctionContext,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { type ActivityView } from '@leather.io/features';
import { type AccountAddresses, type Activity } from '@leather.io/models';
import { type UserSettings, getActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';
import { defaultSelect } from './activity.query-config';

type Sip10ActivityQueryOptions<TData = ActivityView[]> = Omit<
  UseQueryOptions<Activity[], Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

export function createSip10ActivityByAssetIdQueryKey(
  account: AccountAddresses,
  assetId: string,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'activity-service--get-sip10-activity-by-asset-id',
    [account, assetId],
    settings
  );
}

export function createSip10ActivityByAssetIdQueryConfig<TData = ActivityView[]>(
  account: AccountAddresses,
  assetId: string,
  settings: UserSettings,
  options: Sip10ActivityQueryOptions<TData> = {}
): UseQueryOptions<Activity[], Error, TData, QueryKey> {
  const { queryKeyContext = [], select, ...queryOptions } = options;
  return {
    queryKey: [
      ...createSip10ActivityByAssetIdQueryKey(account, assetId, settings),
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getSip10ActivityByAssetId(account, assetId, signal),
    select: select ?? (activity => defaultSelect(activity, settings)),
    ...activityQueryOptions,
    ...queryOptions,
  } as UseQueryOptions<Activity[], Error, TData, QueryKey>;
}
