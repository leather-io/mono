import { useQuery } from '@tanstack/react-query';

import { AddressBalanceResponse } from '../../../types/account';
import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { RateLimiter, useHiroApiRateLimiter } from '../rate-limiter';
import { StacksClient, useStacksClient } from '../stacks-client';

const staleTime = 1 * 60 * 1000;

const balanceQueryOptions = {
  staleTime,
  keepPreviousData: false,
  refetchOnMount: true,
} as const;

function fetchAccountBalance(client: StacksClient, limiter: RateLimiter) {
  return async (principal: string) => {
    await limiter.removeTokens(1);
    // Coercing type with client-side one that's more accurate
    return client.accountsApi.getAccountBalance({ principal }) as Promise<AddressBalanceResponse>;
  };
}

type FetchAccountBalanceResp = Awaited<ReturnType<ReturnType<typeof fetchAccountBalance>>>;

export function useStacksAccountBalanceQuery<T extends unknown = FetchAccountBalanceResp>(
  address: string,
  options?: AppUseQueryConfig<FetchAccountBalanceResp, T>
) {
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();
  const network = useCurrentNetworkState();

  return useQuery({
    enabled: !!address,
    queryKey: ['get-address-stx-balance', address, network.id],
    queryFn: () => fetchAccountBalance(client, limiter)(address),
    ...balanceQueryOptions,
    ...options,
  });
}
