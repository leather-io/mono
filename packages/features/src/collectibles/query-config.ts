import { QueryFunctionContext, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';

import { type AccountAddresses, type NonFungibleCryptoAsset } from '@leather.io/models';
import { getCollectiblesService } from '@leather.io/services';

export type UseAccountCollectiblesQueryOptions = Omit<
  UseQueryOptions<NonFungibleCryptoAsset[], Error, NonFungibleCryptoAsset[], QueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKeyContext?: readonly unknown[];
};

export function getAccountCollectiblesQueryKey(account: AccountAddresses) {
  const { id, bitcoin, stacks } = account;
  return [
    id.fingerprint,
    id.accountIndex,
    bitcoin?.taprootDescriptor ?? null,
    bitcoin?.nativeSegwitDescriptor ?? null,
    bitcoin?.zeroIndexNativeSegwitPayerAddress ?? null,
    bitcoin?.zeroIndexTaprootPayerAddress ?? null,
    stacks?.stxAddress ?? null,
  ];
}

export function getAccountCollectiblesQueryConfig(
  account: AccountAddresses,
  options: UseAccountCollectiblesQueryOptions = {}
): UseQueryOptions<NonFungibleCryptoAsset[], Error, NonFungibleCryptoAsset[], QueryKey> {
  const { queryKeyContext = [], ...queryOptions } = options;

  return {
    queryKey: [
      'collectibles-service-get-account-collectibles',
      ...getAccountCollectiblesQueryKey(account),
      ...queryKeyContext,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles({ account }, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 5000,
    gcTime: 5000,
    ...queryOptions,
  } satisfies UseQueryOptions<NonFungibleCryptoAsset[], Error, NonFungibleCryptoAsset[], QueryKey>;
}
