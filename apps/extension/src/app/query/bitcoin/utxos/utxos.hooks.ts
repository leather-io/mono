import { useCallback } from 'react';

import { emptyUtxos, getHttpCacheService } from '@leather.io/services';

import { useTaprootAccountRequest } from '@app/services/accounts/use-taproot-account-request';

import { useNativeSegwitAccountRequest } from '../../../services/accounts/use-native-segwit-account-request';
import { useGetAccountUtxosQuery } from './utxos.query';

export function useCurrentNativeSegwitUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  const query = useGetAccountUtxosQuery(accountRequest);

  const refetchUtxos = useCallback(async () => {
    await Promise.all([
      getHttpCacheService().clear('leather-api-utxos'),
      getHttpCacheService().clear('leather-api-bitcoin-descriptor-transactions'),
    ]);
    await query.refetch();
  }, [query]);

  return {
    isLoading: query.isLoading,
    utxos: query.data ?? emptyUtxos,
    refetchUtxos,
  };
}

export function useCurrentNativeSegwitInscribedUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  const utxos = useGetAccountUtxosQuery({
    ...accountRequest,
    protections: {
      ...accountRequest.protections,
      discardRunes: true,
    },
  });
  return {
    isLoading: utxos.isLoading,
    utxos: utxos.data?.protected ?? [],
  };
}

export function useCurrentTaprootUninscribedUtxos() {
  const accountRequest = useTaprootAccountRequest();
  const utxos = useGetAccountUtxosQuery({
    ...accountRequest,
    protections: {
      ...accountRequest.protections,
      discardRunes: true,
    },
  });
  return {
    isLoading: utxos.isLoading,
    utxos: utxos.data?.protected ?? [],
  };
}
