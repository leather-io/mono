import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { QueryPrefixes } from '../../../query-prefixes';
import { StacksClient, useStacksClient } from '../../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = { cacheTime: staleTime, staleTime, refetchhOnFocus: false } as const;

function fetchNonFungibleTokenHoldings(client: StacksClient) {
  return async (address: string) => {
    if (!address) return;
    return client.getNftHoldings(address);
  };
}

export function createNonFungibleTokenHoldingsQuery(
  address: string,
  network: string,
  client: StacksClient
) {
  return {
    enabled: !!address,
    queryKey: [QueryPrefixes.GetNftHoldings, address, network],
    queryFn: () => fetchNonFungibleTokenHoldings(client)(address),
    ...queryOptions,
  };
}

export function useGetNonFungibleTokenHoldingsQuery(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery(createNonFungibleTokenHoldingsQuery(address, network.chain.stacks.url, client));
}
