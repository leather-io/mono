import { QueryFunctionContext } from '@tanstack/react-query';

import { ChainID } from '@leather.io/models';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

interface CreateGetStx20BalancesQueryOptionsArgs {
  address: string;
  chainId: ChainID;
  client: StacksClient;
}
export function createGetStx20BalancesQueryOptions({
  address,
  chainId,
  client,
}: CreateGetStx20BalancesQueryOptionsArgs) {
  return {
    enabled: chainId === ChainID.Mainnet,
    queryKey: [StacksQueryPrefixes.GetStx20Balances, address],
    queryFn: ({ signal }: QueryFunctionContext) => client.getStx20Balances(address, signal),
  } as const;
}
