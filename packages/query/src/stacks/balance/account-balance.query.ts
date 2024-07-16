import { QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

const staleTime = 1 * 60 * 1000;

const queryOptions = {
  staleTime,
  refetchOnMount: true,
} as const;

interface CreateGetStacksAccountBalanceQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetStacksAccountBalanceQueryOptions({
  address,
  client,
  network,
}: CreateGetStacksAccountBalanceQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetAccountBalance, address, network],
    queryFn: ({ signal }: QueryFunctionContext) => client.getAccountBalance(address, signal),
    ...queryOptions,
  } as const;
}
