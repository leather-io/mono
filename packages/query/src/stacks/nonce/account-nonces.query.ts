import type { QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { type StacksClient } from '../stacks-client';

const queryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

interface CreateGetAccountNoncesQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetAccountNoncesQueryOptions({
  address,
  client,
  network,
}: CreateGetAccountNoncesQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetAccountNonces, address, network],
    queryFn: ({ signal }: QueryFunctionContext) => client.getAccountNonces(address, signal),
    ...queryOptions,
  } as const;
}
