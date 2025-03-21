import { useQueries } from '@tanstack/react-query';

import { createGetTransactionByIdQueryOptions } from '@leather.io/query';

import { useStacksClient } from '../stacks/stacks-client';

export function useGetTransactionByIdListQuery(txids: string[]) {
  const client = useStacksClient();

  return useQueries({
    queries: txids.map(txid => {
      return {
        ...createGetTransactionByIdQueryOptions({ client, txid }),
      };
    }),
  });
}
