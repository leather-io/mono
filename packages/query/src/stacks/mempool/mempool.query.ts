import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

interface CreateGetAddressMempoolTransactionsQueryOptionsArgs {
  address: string;
  client: StacksClient;
}
export function createGetAddressMempoolTransactionsQueryOptions({
  address,
  client,
}: CreateGetAddressMempoolTransactionsQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetAddressMempoolTransactions, address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      client.getAddressMempoolTransactions(address, signal),
  } as const;
}

export function useGetAddressMempoolTransactionsQuery(address: string) {
  const client = useStacksClient();
  return useQuery(createGetAddressMempoolTransactionsQueryOptions({ address, client }));
}
