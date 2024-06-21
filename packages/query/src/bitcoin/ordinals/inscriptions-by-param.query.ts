import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';
import { useQueries, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { BitcoinTx } from '@leather.io/models';
import { HIRO_INSCRIPTIONS_API_URL } from '@leather.io/models';

import { Paginated } from '../../../types/api-types';
import { InscriptionResponseHiro } from '../../../types/inscription';
import { AppUseQueryConfig } from '../../query-config';

type FetchInscriptionResp = Awaited<ReturnType<ReturnType<typeof fetchInscriptionsByParam>>>;

function fetchInscriptionsByParam() {
  return async (param: string) => {
    const res = await axios.get(`${HIRO_INSCRIPTIONS_API_URL}?${param}`);
    return res.data as Paginated<InscriptionResponseHiro[]>;
  };
}

const weekInMs = 1000 * 60 * 60 * 24 * 7;
const inscriptionsByOutputQueryOptions = {
  staleTime: weekInMs,
  gcTime: weekInMs,
} as const;

export function useGetInscriptionsByOutputQuery<T extends unknown = FetchInscriptionResp>(
  transaction: BitcoinTx,
  options?: AppUseQueryConfig<FetchInscriptionResp, T>
) {
  const inputsLength = transaction.vin.length;
  const index = inputsLength === 1 ? 0 : inputsLength - 2;
  const isPending = !transaction.status.confirmed;
  const id = isPending ? transaction.vin[index].txid : transaction.txid;
  const param = `output=${id}:${index}`;

  return useQuery({
    enabled: !!param,
    queryKey: ['inscription-by-param', isPending, param],
    queryFn: () => fetchInscriptionsByParam()(param),
    ...inscriptionsByOutputQueryOptions,
    ...options,
  });
}

const inscriptionsByOutputQueriesOptions = {
  gcTime: Infinity,
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

export function useGetInscriptionsByOutputQueries(inputs: TransactionInput[]) {
  return useQueries({
    queries: inputs.map(input => {
      const param = input.txid ? `output=${bytesToHex(input.txid)}:${input.index}` : '';

      return {
        queryKey: ['inscription-by-param', false, param],
        queryFn: () => fetchInscriptionsByParam()(param),
        ...inscriptionsByOutputQueriesOptions,
      };
    }),
  });
}
