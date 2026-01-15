import { type QueryFunctionContext, type UseQueryOptions } from '@tanstack/react-query';

import { type NonFungibleCryptoAsset } from '@leather.io/models';
import {
  type AccountRequest,
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
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[], Error>;
}
