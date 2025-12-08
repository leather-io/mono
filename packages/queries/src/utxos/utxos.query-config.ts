import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { type AccountRequest, type UserSettings, getUtxosService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createAccountUtxosQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey('utxos-service--get-account-utxos', [request], settings);
}

export function createAccountUtxosQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createAccountUtxosQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1000,
    gcTime: 1000,
  } satisfies UseQueryOptions<unknown, Error>;
}

