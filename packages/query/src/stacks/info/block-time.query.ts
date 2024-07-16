import { useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

export function createGetStacksNetworkBlockTimeQueryOptions(client: StacksClient) {
  return {
    queryKey: [StacksQueryPrefixes.GetNetworkBlockTime],
    queryFn: () => client.getNetworkBlockTimes(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  } as const;
}

export function useGetStacksNetworkBlockTimeQuery() {
  const client = useStacksClient();
  return useQuery(createGetStacksNetworkBlockTimeQueryOptions(client));
}
