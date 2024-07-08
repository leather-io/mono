import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import type { AppUseQueryConfig } from '../../query-config';
import { type StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

function fetchAccountNonces(client: StacksClient, signal: AbortSignal) {
  return async (address: string) => client.getAccountNonces(address, signal);
}

type FetchAccountNoncesResp = Awaited<ReturnType<ReturnType<typeof fetchAccountNonces>>>;

export function useGetAccountNoncesQuery<T extends unknown = FetchAccountNoncesResp>(
  address: string,
  options?: AppUseQueryConfig<FetchAccountNoncesResp, T>
) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();

  return useQuery({
    enabled: !!address,
    queryKey: ['account-nonces', address, network],
    queryFn: ({ signal }) => fetchAccountNonces(client, signal)(address),
    ...queryOptions,
    ...options,
  });
}
