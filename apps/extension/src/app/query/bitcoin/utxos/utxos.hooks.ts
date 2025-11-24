import { useCallback } from 'react';

import type { HDKey } from '@scure/bip32';
import { useQuery } from '@tanstack/react-query';

import { createGetTaprootUtxosByAddressQueryOptions } from '@leather.io/query';
import { emptyUtxos, getHttpCacheService } from '@leather.io/services';

import { useLeatherNetwork } from '@app/query/leather-query-provider';
import { toFetchState } from '@app/services/fetch-state';

import { useNativeSegwitAccountRequest } from '../../../services/accounts/use-native-segwit-account-request';
import { useBitcoinClient } from '../clients/bitcoin-client';
import { useGetAccountUtxosQuery } from './utxos.query';

export function useCurrentNativeSegwitUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  const query = useGetAccountUtxosQuery(accountRequest);
  const utxos = toFetchState(query);

  const refetchUtxos = useCallback(async () => {
    await Promise.all([
      getHttpCacheService().clear('leather-api-utxos'),
      getHttpCacheService().clear('leather-api-bitcoin-descriptor-transactions'),
    ]);
    await query.refetch();
  }, [query]);

  return {
    isLoading: utxos.state !== 'success',
    utxos: utxos.value ?? emptyUtxos,
    refetchUtxos,
  };
}

export function useCurrentNativeSegwitInscribedUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  const utxos = toFetchState(
    useGetAccountUtxosQuery({
      ...accountRequest,
      protections: {
        ...accountRequest.protections,
        discardRunes: true,
      },
    })
  );
  return {
    isLoading: utxos.state !== 'success',
    utxos: utxos.value?.protected ?? [],
  };
}

/**
 * Returns all utxos for the user's current taproot account. The search for
 * utxos iterates through all addresses until a sufficiently large number of
 * empty addresses is found.
 */
export function useGetTaprootUtxosByAddressQuery({
  taprootKeychain,
  currentAccountIndex,
}: {
  taprootKeychain: HDKey | undefined;
  currentAccountIndex: number;
}) {
  const network = useLeatherNetwork();
  const client = useBitcoinClient();

  return useQuery(
    createGetTaprootUtxosByAddressQueryOptions({
      client,
      currentAccountIndex,
      network,
      taprootKeychain,
    })
  );
}
