import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

export function useRawTransactionById(txid: string) {
  const client = useStacksClient();

  async function rawTransactionByIdFetcher(txid: string) {
    return client.getRawTransactionById(txid);
  }

  return useQuery({
    queryKey: ['raw-transaction-by-id', txid],
    queryFn: () => rawTransactionByIdFetcher(txid),
  });
}
