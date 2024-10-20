import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = {
  gcTime: staleTime,
  placeholderData: keepPreviousData,
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

export function useGetStacksNetworkStatusQuery(url: string) {
  const client = useStacksClient();
  return useQuery(createGetNetworkStatusQueryOptions({ client, url }));
}
