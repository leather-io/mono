import { type QueryFunctionContext, type UseQueryOptions } from '@tanstack/react-query';

import { type NonFungibleCryptoAsset, type Sip9Asset } from '@leather.io/models';
import {
  type AccountRequest,
  type CollectibleTransferBlocker,
  type UserSettings,
  getCollectiblesService,
} from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { collectiblesQueryOptions } from '../shared/query-options';

export function createAccountCollectiblesQueryKey(request: AccountRequest, settings: UserSettings) {
  return createServiceQueryKey(
    'collectibles-service--get-account-collectibles',
    [request],
    settings
  );
}

export function createAccountCollectiblesQueryConfig(
  request: AccountRequest,
  settings: UserSettings,
  queryKeyContext: readonly unknown[] = []
) {
  return {
    queryKey: [...createAccountCollectiblesQueryKey(request, settings), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles(request, signal),
    ...collectiblesQueryOptions,
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[]>;
}

export function createCollectibleTransferBlockerQueryKey(asset: Sip9Asset, settings: UserSettings) {
  return createServiceQueryKey(
    'collectibles-service--get-collectible-transfer-blocker',
    [asset.assetId, asset.tokenId],
    settings
  );
}

export function createCollectibleTransferBlockerQueryConfig(
  asset: Sip9Asset,
  settings: UserSettings
) {
  return {
    queryKey: createCollectibleTransferBlockerQueryKey(asset, settings),
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getCollectibleTransferBlocker(asset, signal),
    refetchOnWindowFocus: false,
    staleTime: 0,
  } satisfies UseQueryOptions<CollectibleTransferBlocker | null>;
}
