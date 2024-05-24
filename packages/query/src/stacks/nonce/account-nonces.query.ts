import { useQuery } from '@tanstack/react-query';
import type PQueue from 'p-queue';

import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useCurrentNetworkState } from '../../leather-query-provider';
import type { AppUseQueryConfig } from '../../query-config';
import { type StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

function fetchAccountNonces(client: StacksClient, limiter: PQueue) {
  return async (address: string) => {
    if (!address) return;

    return limiter.add(() => client.accountsApi.getAccountNonces({ principal: address }), {
      throwOnTimeout: true,
    });
  };
}

type FetchAccountNoncesResp = Awaited<ReturnType<ReturnType<typeof fetchAccountNonces>>>;

export function useGetAccountNoncesQuery<T extends unknown = FetchAccountNoncesResp>(
  address: string,
  options?: AppUseQueryConfig<FetchAccountNoncesResp, T>
) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  return useQuery({
    enabled: !!address,
    queryKey: ['account-nonces', address, network],
    queryFn: () => fetchAccountNonces(client, limiter)(address),
    ...queryOptions,
    ...options,
  });
}
