import type { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';
import { useQueries } from '@tanstack/react-query';

import { createGetInscriptionsByParamQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';

export function useGetInscriptionsByOutputList(inputs: TransactionInput[]) {
  const client = useBitcoinClient();
  const params = uniqueArray(
    inputs.map(input => (input.txid ? `${bytesToHex(input.txid)}:${input.index}` : ''))
  );

  return useQueries({
    queries: params.map(param =>
      createGetInscriptionsByParamQueryOptions({
        param,
        BestInSlotApi: client.BestInSlotApi,
      })
    ),
  });
}
