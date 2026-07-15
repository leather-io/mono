import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import type { Sip10Asset } from '@leather.io/models';
import { type UserSettings, getSip10AssetService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';

export function createSip10AssetByPrincipalQueryKey(principal: string, settings: UserSettings) {
  return createServiceQueryKey(
    'sip10-asset-service--get-asset-by-principal',
    [principal],
    settings
  );
}

export function createSip10AssetByPrincipalQueryConfig(principal: string, settings: UserSettings) {
  return {
    queryKey: createSip10AssetByPrincipalQueryKey(principal, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10AssetService().getAssetByPrincipal(principal, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: 300_000,
    gcTime: 300_000,
  } satisfies UseQueryOptions<Sip10Asset, Error>;
}
