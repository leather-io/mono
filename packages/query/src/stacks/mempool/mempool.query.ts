import type { QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

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
