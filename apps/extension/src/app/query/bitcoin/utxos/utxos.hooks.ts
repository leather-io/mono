import { useCallback } from 'react';

import { type AccountRequest, emptyUtxos, getHttpCacheService } from '@leather.io/services';

import { useAccountRequest } from '@app/services/accounts/use-account-request';
import { useTaprootAccountRequest } from '@app/services/accounts/use-taproot-account-request';
import { toFetchState } from '@app/services/fetch-state';

import { useNativeSegwitAccountRequest } from '../../../services/accounts/use-native-segwit-account-request';
import { useGetAccountUtxosQuery } from './utxos.query';

function useUtxos(request: AccountRequest) {
  const query = useGetAccountUtxosQuery(request);
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

export function useCurrentNativeSegwitUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  return useUtxos(accountRequest);
}

export function useCurrentUtxos() {
  const accountRequest = useAccountRequest();
  return useUtxos(accountRequest);
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
