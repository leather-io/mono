import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient } from '../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = {
  gcTime: staleTime,
  placeholderData<T>(previousData: T | undefined): T | undefined {
    return previousData;
  },
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
} as const;

interface CreateGetNetworkStatusQueryOptionsArgs {
  client: StacksClient;
  url: string;
}
export function createGetNetworkStatusQueryOptions({
  client,
  url,
}: CreateGetNetworkStatusQueryOptionsArgs) {
  return {
    queryKey: [StacksQueryPrefixes.GetNetworkStatus, url],
    queryFn: () => client.getNetworkStatus(url),
    ...queryOptions,
  } as const;
}
