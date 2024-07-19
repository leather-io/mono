import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';

import { HIRO_INSCRIPTIONS_API_URL } from '@leather.io/models';

import { Paginated } from '../../../types/api-types';
import { InscriptionResponseHiro } from '../../../types/inscription';
import { BitcoinQueryPrefixes } from '../../query-prefixes';

const weekInMs = 1000 * 60 * 60 * 24 * 7;

const queryOptions = {
  staleTime: weekInMs,
  gcTime: weekInMs,
} as const;

async function fetchInscriptionsByParam(param: string) {
  const res = await axios.get(`${HIRO_INSCRIPTIONS_API_URL}?${param}`);
  return res.data as Paginated<InscriptionResponseHiro[]>;
}

interface CreateGetInscriptionsByParamQueryOptionsArgs {
  isPending?: boolean;
  param: string;
}
export function createGetInscriptionsByParamQueryOptions({
  isPending,
  param,
}: CreateGetInscriptionsByParamQueryOptionsArgs) {
  return {
    enabled: !!param,
    queryKey: [BitcoinQueryPrefixes.GetInscriptionsByParam, isPending, param],
    queryFn: () => fetchInscriptionsByParam(param),
    ...queryOptions,
  } as const;
}

export function useGetInscriptionsByOutputList(inputs: TransactionInput[]) {
  return useQueries({
    queries: inputs.map(input => {
      const param = input.txid ? `output=${bytesToHex(input.txid)}:${input.index}` : '';
      return createGetInscriptionsByParamQueryOptions({ param });
    }),
  });
}
