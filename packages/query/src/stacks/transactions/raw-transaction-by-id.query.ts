import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

export function useRawTransactionById(txid: string) {
  const client = useStacksClient();

  async function rawTransactionByIdFetcher(txid: string, signal: AbortSignal) {
    return client.getRawTransactionById(txid, signal);
  }

  return useQuery({
    queryKey: ['raw-transaction-by-id', txid],
    queryFn: ({ signal }) => rawTransactionByIdFetcher(txid, signal),
  });
}
