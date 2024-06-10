import { useQueries, useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

const options = {
  staleTime: 30 * 1000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
} as const;

export function useTransactionsById(txids: string[]) {
  const client = useStacksClient();

  async function transactionByIdFetcher(txid: string) {
    return client.getTransactionById(txid);
  }

  return useQueries({
    queries: txids.map(txid => {
      return {
        queryKey: ['transaction-by-id', txid],
        queryFn: () => transactionByIdFetcher(txid),
        ...options,
      };
    }),
  });
}

export function useTransactionById(txid: string) {
  const client = useStacksClient();

  async function transactionByIdFetcher(txid: string) {
    return client.getTransactionById(txid);
  }

  return useQuery({
    queryKey: ['transaction-by-id', txid],
    queryFn: () => transactionByIdFetcher(txid),
    ...options,
  });
}
