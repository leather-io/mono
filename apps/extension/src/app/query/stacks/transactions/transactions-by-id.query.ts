import { useQueries, useQuery } from '@tanstack/react-query';

import { createGetTransactionByIdQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useStacksClient } from '../stacks-client';

export function useGetTransactionByIdQuery(txid: string) {
  const client = useStacksClient();
  return useQuery(createGetTransactionByIdQueryOptions({ client, txid }));
}

export function useGetTransactionByIdListQuery(txids: string[]) {
  const client = useStacksClient();
  const uniqueTxids = uniqueArray(txids);

  return useQueries({
    queries: uniqueTxids.map(txid => ({
      ...createGetTransactionByIdQueryOptions({ client, txid }),
    })),
  });
}
