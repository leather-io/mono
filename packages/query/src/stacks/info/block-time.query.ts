import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

export function createGetStacksNetworkBlockTimeQueryOptions(client: StacksClient) {
  return {
    queryKey: [StacksQueryPrefixes.GetNetworkBlockTime],
    queryFn: () => client.getNetworkBlockTimes(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  } as const;
}
