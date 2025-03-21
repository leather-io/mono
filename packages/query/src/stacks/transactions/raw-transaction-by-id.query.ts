import type { QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

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
    queryFn: ({ signal }: QueryFunctionContext) => client.getRawTransactionById(txid, signal),
  } as const;
}
