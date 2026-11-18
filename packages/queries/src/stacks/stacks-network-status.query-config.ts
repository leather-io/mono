import {
  type QueryFunctionContext,
  type UseQueryOptions,
  keepPreviousData,
} from '@tanstack/react-query';

import { type UserSettings, getHiroStacksApiClient } from '@leather.io/services';
import { minutesInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksNetworkStatusQueryKey(url: string, settings: UserSettings) {
  return createServiceQueryKey('hiro-stacks-api-client--get-network-status', [url], settings);
}

export function createStacksNetworkStatusQueryConfig(url: string, settings: UserSettings) {
  return {
    queryKey: createStacksNetworkStatusQueryKey(url, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getNetworkStatus(url, { signal }),
    gcTime: minutesInMs(15),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnReconnect: false,
  } satisfies UseQueryOptions;
}
