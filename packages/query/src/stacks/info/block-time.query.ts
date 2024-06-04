import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

export function useGetStackNetworkBlockTimeQuery() {
  const client = useStacksClient();

  return useQuery({
    queryKey: ['stacks-block-time'],
    queryFn: () => client.getNetworkBlockTimes(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
