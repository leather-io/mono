import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

const networkStatusQueryOptions = {
  keepPreviousData: true,
  cacheTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
} as const;

export function useGetNetworkStatus(url: string) {
  const client = useStacksClient();

  return useQuery({
    queryKey: ['network-status', url],
    queryFn: () => client.getNetworkStatus(url),
    ...networkStatusQueryOptions,
  });
}
