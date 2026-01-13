import { type QueryFunctionContext, type UseQueryOptions } from '@tanstack/react-query';

import { type AccountAddresses, type NonFungibleCryptoAsset } from '@leather.io/models';
import { type UserSettings, getCollectiblesService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { collectiblesQueryOptions } from '../shared/query-options';

function createAccountCollectiblesKeyParams(account: AccountAddresses) {
  const { id, bitcoin, stacks } = account;
  return [
    id.fingerprint,
    id.accountIndex,
    bitcoin?.taprootDescriptor ?? null,
    bitcoin?.nativeSegwitDescriptor ?? null,
    bitcoin?.zeroIndexNativeSegwitPayerAddress ?? null,
    bitcoin?.zeroIndexTaprootPayerAddress ?? null,
    stacks?.stxAddress ?? null,
  ] as const;
}

export function createAccountCollectiblesQueryKey(
  account: AccountAddresses,
  settings: UserSettings
) {
  return createServiceQueryKey(
    'collectibles-service--get-account-collectibles',
    createAccountCollectiblesKeyParams(account),
    settings
  );
}

export function createAccountCollectiblesQueryConfig(
  account: AccountAddresses,
  settings: UserSettings,
  queryKeyContext: readonly unknown[] = []
) {
  return {
    queryKey: [...createAccountCollectiblesQueryKey(account, settings), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles({ account }, signal),
    ...collectiblesQueryOptions,
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[], Error>;
}
