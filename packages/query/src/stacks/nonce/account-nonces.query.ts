import { useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { useHiroApiRateLimiter } from '../hiro-rate-limiter';
import { StacksClient, useStacksClient } from '../stacks-client';

const accountNoncesQueryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

function fetchAccountNonces(client: StacksClient, limiter: PQueue) {
  return async (principal: string) => {
    if (!principal) return;

    return limiter.add(
      () =>
        client.accountsApi.getAccountNonces({
          principal,
        }),
      {
        throwOnTimeout: true,
      }
    );
  };
}

type FetchAccountNoncesResp = Awaited<ReturnType<ReturnType<typeof fetchAccountNonces>>>;

export function useGetAccountNoncesQuery<T extends unknown = FetchAccountNoncesResp>(
  { stacksAddress }: { stacksAddress: string },
  options?: AppUseQueryConfig<FetchAccountNoncesResp, T>
) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  return useQuery({
    enabled: !!stacksAddress,
    queryKey: ['account-nonces', stacksAddress, network],
    queryFn: () => fetchAccountNonces(client, limiter)(stacksAddress),
    ...accountNoncesQueryOptions,
    ...options,
  });
}
