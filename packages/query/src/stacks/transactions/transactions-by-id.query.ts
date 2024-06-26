import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

const options = {
  staleTime: 30 * 1000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
} as const;

export function useTransactionsById(txids: string[]) {
  const client = useStacksClient();

  return useQueries({
    queries: txids.map(txid => {
      return {
        queryKey: ['transaction-by-id', txid],
        queryFn: ({ signal }: QueryFunctionContext) => client.getTransactionById(txid, signal),
        ...options,
      };
    }),
  });
}

export function useTransactionById(txid: string) {
  const client = useStacksClient();

  return useQuery({
    queryKey: ['transaction-by-id', txid],
    queryFn: ({ signal }) => client.getTransactionById(txid, signal),
    ...options,
  });
}
