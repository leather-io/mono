import { useQueries, useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  staleTime: 30 * 1000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
} as const;

interface CreateGetTransactionByIdQueryOptionsArgs {
  client: StacksClient;
  txid: string;
}
export function createGetTransactionByIdQueryOptions({
  client,
  txid,
}: CreateGetTransactionByIdQueryOptionsArgs) {
  return {
    queryKey: [StacksQueryPrefixes.GetTransactionById, txid],
    queryFn: () => client.getTransactionById(txid),
    ...queryOptions,
  } as const;
}

export function useGetTransactionByIdQuery(txid: string) {
  const client = useStacksClient();
  return useQuery(createGetTransactionByIdQueryOptions({ client, txid }));
}

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
