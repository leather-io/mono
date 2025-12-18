import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { ChainId } from '@leather.io/models';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

interface CreateGetStx20BalancesQueryOptionsArgs {
  address: string;
  chainId: ChainId;
  client: StacksClient;
}
export function createGetStx20BalancesQueryOptions({
  address,
  chainId,
  client,
}: CreateGetStx20BalancesQueryOptionsArgs) {
  return {
    enabled: !!address && chainId === ChainId.Mainnet,
    queryKey: [StacksQueryPrefixes.GetStx20Balances, address],
    queryFn: ({ signal }: QueryFunctionContext) => client.getStx20Balances(address, signal),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  } satisfies UseQueryOptions<any, unknown, any>;
}
