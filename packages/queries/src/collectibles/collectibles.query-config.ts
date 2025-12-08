import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { NonFungibleCryptoAsset } from '@leather.io/models';
import { type AccountRequest, type UserSettings, getCollectiblesService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createAccountCollectiblesQueryKey(
  request: AccountRequest,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'collectibles-service--get-account-collectibles',
    [request],
    settings
  );
}

export function createAccountCollectiblesQueryConfig(
  request: AccountRequest,
  settings: UserSettings
) {
  return {
    queryKey: createAccountCollectiblesQueryKey(request, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 5000,
    gcTime: 5000,
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[], Error>;
}

