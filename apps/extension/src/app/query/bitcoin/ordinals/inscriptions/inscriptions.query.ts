import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { createInscriptionsQuery } from '@leather.io/queries';
import { findInscriptionsOnUtxo } from '@leather.io/query';

import { useAccountRequest } from '@app/services/accounts/use-account-request';
import { useNativeSegwitAccountRequest } from '@app/services/accounts/use-native-segwit-account-request';

export function useInscriptions() {
  const request = useAccountRequest();
  return useQuery(createInscriptionsQuery(request));
}

export function useNumberOfInscriptionsOnUtxo() {
  const inscriptions = useInscriptions();

  // Unsafe as implementation doesn't wait for all results to be successful,
  // assumes they are
  return useCallback(
    (txid: string, vout: number) =>
      findInscriptionsOnUtxo({ txId: txid, index: vout, inscriptions: inscriptions.data ?? [] })
        .length,
    [inscriptions.data]
  );
}

export function useCurrentNativeSegwitInscriptions() {
  const request = useNativeSegwitAccountRequest();
  return useQuery(createInscriptionsQuery(request));
}
