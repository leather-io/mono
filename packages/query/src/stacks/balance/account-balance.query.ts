import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { StacksClient, useStacksClient } from '../stacks-client';

const staleTime = 1 * 60 * 1000;

const balanceQueryOptions = {
  staleTime,
  refetchOnMount: true,
} as const;

function fetchAccountBalance(client: StacksClient, signal?: AbortSignal) {
  return async (address: string) => client.getAccountBalance(address, signal);
}

type FetchAccountBalanceResp = Awaited<ReturnType<ReturnType<typeof fetchAccountBalance>>>;

export function useStacksAccountBalanceQuery<T extends unknown = FetchAccountBalanceResp>(
  address: string,
  options?: AppUseQueryConfig<FetchAccountBalanceResp, T>
) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    enabled: !!address,
    queryKey: ['get-address-stx-balance', address, network.id],
    queryFn: async ({ signal }) => fetchAccountBalance(client, signal)(address),
    ...balanceQueryOptions,
    ...options,
  });
}
