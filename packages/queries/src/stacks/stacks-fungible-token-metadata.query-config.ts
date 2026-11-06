import type { QueryFunctionContext } from '@tanstack/react-query';

import {
  type HiroFtMetadata,
  type UserSettings,
  getHiroStacksApiClient,
} from '@leather.io/services';
import { oneWeekInMs } from '@leather.io/utils';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksFungibleTokenMetadataQueryKey(
  principal: string,
  settings: UserSettings
) {
  return createServiceQueryKey('hiro-stacks-api-client--get-ft-metadata', [principal], settings);
}

export function createStacksFungibleTokenMetadataQueryConfig(
  principal: string,
  settings: UserSettings
) {
  return {
    enabled: !!principal,
    queryKey: createStacksFungibleTokenMetadataQueryKey(principal, settings),
    queryFn: ({ signal }: QueryFunctionContext): Promise<HiroFtMetadata | null> =>
      getHiroStacksApiClient().getFtMetadata(principal, { signal }),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: oneWeekInMs,
    gcTime: Infinity,
    retry: 0,
  };
}
