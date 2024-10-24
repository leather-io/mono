import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { StacksClient, StacksQueryPrefixes, useStacksClient } from '@leather.io/query';

// TOODO - duplicated but needs to be extended to support multi address
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
