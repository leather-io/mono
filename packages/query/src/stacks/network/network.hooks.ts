import { useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';
import { createGetNetworkStatusQueryOptions } from './network.query';

export function useStacksNetworkStatus(url: string) {
  const client = useStacksClient();

  return useQuery({
    ...createGetNetworkStatusQueryOptions({ client, url }),
    select: resp => resp.isSuccess,
  });
}
