import { type QueryFunctionContext, type UseQueryOptions } from '@tanstack/react-query';

import { type AccountAddresses, type Activity } from '@leather.io/models';
import { type UserSettings, getActivityService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

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

export function createSip10ActivityByAssetIdQueryConfig(
  account: AccountAddresses,
  assetId: string,
  settings: UserSettings
) {
  return {
    queryKey: createSip10ActivityByAssetIdQueryKey(account, assetId, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getSip10ActivityByAssetId(account, assetId, signal),
    ...activityQueryOptions,
  } satisfies UseQueryOptions<Activity[], Error>;
}
