import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { StacksAccountNonces } from '@leather.io/models';
import { type UserSettings, getHiroStacksApiClient } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createStacksAccountNoncesQueryKey(address: string, settings: UserSettings) {
  return createServiceQueryKey('hiro-stacks-api-client--get-account-nonces', [address], settings);
}

export function createStacksAccountNoncesQueryConfig(address: string, settings: UserSettings) {
  return {
    enabled: !!address,
    queryKey: createStacksAccountNoncesQueryKey(address, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getHiroStacksApiClient().getAccountNonces(address, { signal }),
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: 'always',
  } satisfies UseQueryOptions<StacksAccountNonces>;
}
