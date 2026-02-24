import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import {
  type ActivityRequest,
  type ActivityResponse,
  type UserSettings,
  getBlockchainActivityService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { activityQueryOptions } from '../shared/query-options';

export function createBlockchainActivityQueryKey(request: ActivityRequest, settings: UserSettings) {
  return createServiceQueryKey('blockchain-activity-service--get-activity', [request], settings);
}

export function createBlockchainActivityQueryConfig(
  request: ActivityRequest,
  settings: UserSettings
) {
  return {
    queryKey: createBlockchainActivityQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBlockchainActivityService().getActivity(request, signal),
    ...activityQueryOptions,
  } satisfies UseQueryOptions<ActivityResponse, Error>;
}
