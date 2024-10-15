import { useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

interface CreateGetRawTransactionByIdQueryOptionsArgs {
  client: StacksClient;
  txid: string;
}
export function createGetRawTransactionByIdQueryOptions({
  client,
  txid,
}: CreateGetRawTransactionByIdQueryOptionsArgs) {
  return {
    queryKey: [StacksQueryPrefixes.GetRawTransactionById, txid],
    queryFn: () => client.getRawTransactionById(txid),
  } as const;
}

export function useGetRawTransactionByIdQuery(txid: string) {
  const client = useStacksClient();
  return useQuery(createGetRawTransactionByIdQueryOptions({ client, txid }));
}
