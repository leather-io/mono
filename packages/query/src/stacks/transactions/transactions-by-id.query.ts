import { type QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

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
    queryFn: ({ signal }: QueryFunctionContext) => client.getTransactionById(txid, signal),
    ...queryOptions,
  } as const;
}
