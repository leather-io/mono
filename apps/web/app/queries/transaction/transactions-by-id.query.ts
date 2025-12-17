import { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import { UseQueryResult, useQueries } from '@tanstack/react-query';

import { createGetTransactionByIdQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useStacksClient } from '../stacks/stacks-client';

export function useGetTransactionByIdListQuery(
  txids: string[]
): UseQueryResult<MempoolTransaction | Transaction, Error>[] {
  const client = useStacksClient();
  const uniqueTxids = uniqueArray(txids);

  return useQueries({
    queries: uniqueTxids.map(txid => {
      return {
        ...createGetTransactionByIdQueryOptions({ client, txid }),
      };
    }),
  });
}
