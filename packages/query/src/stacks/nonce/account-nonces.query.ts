import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { RateLimiter, useHiroApiRateLimiter } from '../rate-limiter';
import { StacksClient, useStacksClient } from '../stacks-client';

const accountNoncesQueryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

function fetchAccountNonces(client: StacksClient, limiter: RateLimiter) {
  return async (principal: string) => {
    if (!principal) return;
    await limiter.removeTokens(1);
    return client.accountsApi.getAccountNonces({
      principal,
    });
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
