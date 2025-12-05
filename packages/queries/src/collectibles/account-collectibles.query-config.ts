import {
  type QueryFunctionContext,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

import { type AccountAddresses, type NonFungibleCryptoAsset } from '@leather.io/models';
import { getCollectiblesService } from '@leather.io/services';

import { createServiceQueryKey } from '../shared/query-key.factory';
import { collectiblesQueryOptions } from '../shared/query-options';

export type UseAccountCollectiblesQueryOptions<TData = NonFungibleCryptoAsset[]> = Omit<
  UseQueryOptions<NonFungibleCryptoAsset[], Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

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

export function createAccountCollectiblesQueryKey(account: AccountAddresses) {
  return createServiceQueryKey(
    'collectibles-service--get-account-collectibles',
    createAccountCollectiblesKeyParams(account)
  );
}

export function createAccountCollectiblesQueryConfig<TData = NonFungibleCryptoAsset[]>(
  account: AccountAddresses,
  options: UseAccountCollectiblesQueryOptions<TData> = {}
): UseQueryOptions<NonFungibleCryptoAsset[], Error, TData, QueryKey> {
  const { queryKeyContext = [], select, ...queryOptions } = options;

  return {
    queryKey: [...createAccountCollectiblesQueryKey(account), ...queryKeyContext],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles({ account }, signal),
    select,
    ...collectiblesQueryOptions,
    ...queryOptions,
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[], Error, TData, QueryKey>;
}

