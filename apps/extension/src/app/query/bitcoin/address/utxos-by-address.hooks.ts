import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { OwnedUtxo } from '@leather.io/models';
import type { UtxoResponseItem } from '@leather.io/query';

import { getUtxosService } from '@leather.io/services';

import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

function ownedUtxoToResponse(utxo: OwnedUtxo): UtxoResponseItem {
  return {
    txid: utxo.txid,
    vout: utxo.vout,
    value: utxo.value,
    status: {
      confirmed: !!utxo.height,
      block_height: utxo.height ?? 0,
      block_hash: '',
      block_time: 0,
    },
  };
}

export function useCurrentNativeSegwitUtxos() {
  const accountRequest = useNativeSegwitAccountRequest();
  const utxosService = useMemo(() => getUtxosService(), []);

  const filteredUtxosQuery = useQuery({
    queryKey: [
      'native-segwit-account-utxos',
      accountRequest.account.id.fingerprint,
      accountRequest.account.id.accountIndex,
      accountRequest.protections?.discardRunes,
      (accountRequest.protections?.discardedInscriptions ?? []).join(','),
    ],
    queryFn: ({ signal }) => utxosService.getAccountUtxos(accountRequest, signal),
  });

  const data = useMemo(
    () => (filteredUtxosQuery.data?.available ?? []).map(ownedUtxoToResponse),
    [filteredUtxosQuery.data?.available]
  );

  return {
    ...filteredUtxosQuery,
    data,
    filteredUtxosQuery,
    isLoadingAllData: filteredUtxosQuery.isLoading,
    isLoadingAdditionalData: false,
  };
}
