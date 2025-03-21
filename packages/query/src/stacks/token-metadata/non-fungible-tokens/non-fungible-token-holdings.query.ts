import { type QueryFunctionContext } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../../query-prefixes';
import { StacksClient } from '../../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = { gcTime: staleTime, staleTime, refetchOnFocus: false } as const;

interface CreateGetNonFungibleTokenHoldingsQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetNonFungibleTokenHoldingsQueryOptions({
  address,
  client,
  network,
}: CreateGetNonFungibleTokenHoldingsQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetNftHoldings, address, network],
    queryFn: ({ signal }: QueryFunctionContext) => client.getNftHoldings(address, signal),
    ...queryOptions,
  } as const;
}
