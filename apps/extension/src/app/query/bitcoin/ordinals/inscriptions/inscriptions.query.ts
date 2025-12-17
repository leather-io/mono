import { useCallback } from 'react';

import { type QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import {
  combineInscriptionResults,
  createInscriptionByXpubQuery,
  createNumberOfInscriptionsFn,
} from '@leather.io/query';
import { type AccountRequest, getInscriptionsService } from '@leather.io/services';
import { minutesInMs, secondsInMs } from '@leather.io/utils';

import { useCurrentNetworkState } from '@app/query/leather-query-provider';
import { useNativeSegwitAccountRequest } from '@app/services/accounts/use-native-segwit-account-request';
import { useCurrentBitcoinAccountXpubs } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

import { useBitcoinClient } from '../../clients/bitcoin-client';

interface UseInscriptionArgs {
  xpubs: string[];
}
export function useInscriptions({ xpubs }: UseInscriptionArgs) {
  const client = useBitcoinClient();
  const queries = xpubs.map(xpub => createInscriptionByXpubQuery(client, xpub));
  return useQueries({ queries, combine: combineInscriptionResults });
}

export function useCurrentAccountInscriptions() {
  const xpubs = useCurrentBitcoinAccountXpubs();
  return useInscriptions({ xpubs });
}

export function useNumberOfInscriptionsOnUtxo() {
  const xpubs = useCurrentBitcoinAccountXpubs();

  const inscriptionQueries = useInscriptions({ xpubs });

  // Unsafe as implementation doesn't wait for all results to be successful,
  // assumes they are
  return useCallback(
    (txid: string, vout: number) => createNumberOfInscriptionsFn(inscriptionQueries)(txid, vout),
    [inscriptionQueries]
  );
}

export function useCurrentNativeSegwitInscriptions() {
  const request = useNativeSegwitAccountRequest();
  return useGetAccountInscriptionsQuery(request);
}

function useGetAccountInscriptionsQuery(request: AccountRequest) {
  const network = useCurrentNetworkState();
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'inscriptions-service-get-account-inscriptions',
      network.id,
      request.account.id.fingerprint,
      request.account.id.accountIndex,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getInscriptionsService().getAccountInscriptions(request, signal),
    staleTime: secondsInMs(10),
    gcTime: minutesInMs(5),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}
