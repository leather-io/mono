import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';
import { useQueries } from '@tanstack/react-query';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BestInSlotApi } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';

const weekInMs = 1000 * 60 * 60 * 24 * 7;

const queryOptions = {
  staleTime: weekInMs,
  gcTime: weekInMs,
} as const;

interface CreateGetInscriptionsByParamQueryOptionsArgs {
  isPending?: boolean;
  param: string;
  BestInSlotApi: ReturnType<typeof BestInSlotApi>;
}
export function createGetInscriptionsByParamQueryOptions({
  isPending,
  param,
  BestInSlotApi,
}: CreateGetInscriptionsByParamQueryOptionsArgs) {
  return {
    enabled: !!param,
    queryKey: [BitcoinQueryPrefixes.GetInscriptionsByParam, isPending, param],
    queryFn: () => BestInSlotApi.getBatchInscriptionInfo([param]),
    ...queryOptions,
  } as const;
}

export function useGetInscriptionsByOutputList(inputs: TransactionInput[]) {
  const client = useBitcoinClient();
  return useQueries({
    queries: inputs.map(input => {
      const param = input.txid ? `${bytesToHex(input.txid)}:${input.index}` : '';
      return createGetInscriptionsByParamQueryOptions({
        param,
        BestInSlotApi: client.BestInSlotApi,
      });
    }),
  });
}
