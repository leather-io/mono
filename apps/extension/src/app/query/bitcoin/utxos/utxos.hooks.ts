import { useCallback } from 'react';

import { emptyUtxos, getHttpCacheService } from '@leather.io/services';

import { useTaprootAccountRequest } from '@app/services/accounts/use-taproot-account-request';
import { toFetchState } from '@app/services/fetch-state';

import { useNativeSegwitAccountRequest } from '@app/services/accounts/use-native-segwit-account-request';
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

export function useCurrentTaprootUninscribedUtxos() {
  const accountRequest = useTaprootAccountRequest();
  const utxos = toFetchState(
    useGetAccountUtxosQuery({
      ...accountRequest,
      protections: {
        ...accountRequest.protections,
        discardRunes: true, // discarding runes ensures only inscription utxos in protected array
      },
    })
  );
  return {
    isLoading: utxos.state !== 'success',
    utxos: utxos.value?.protected ?? [],
  };
}
