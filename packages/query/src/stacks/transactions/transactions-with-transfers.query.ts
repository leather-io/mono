import { DEFAULT_LIST_LIMIT } from '@leather-wallet/constants';
import { AddressTransactionsWithTransfersListResponse } from '@stacks/stacks-blockchain-api-types';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useCurrentNetworkState } from '../../leather-query-provider';
import { useStacksClient } from '../stacks-client';

const queryOptions: UseQueryOptions = {
  staleTime: 60 * 1000,
  refetchInterval: 30_000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
};

export function useGetAccountTransactionsWithTransfersQuery(address: string) {
  const { chain } = useCurrentNetworkState();
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function fetchAccountTxsWithTransfers(signal?: AbortSignal) {
    if (!address) return;
    return limiter.add(
      () =>
        client.accountsApi.getAccountTransactionsWithTransfers({
          principal: address,
          limit: DEFAULT_LIST_LIMIT,
        }),
      {
        signal,
        throwOnTimeout: true,
      }
    );
  }

  return useQuery({
    enabled: !!address && !!chain.stacks.url,
    queryKey: ['account-txs-with-transfers', address, chain.stacks.url],
    queryFn: ({ signal }) => fetchAccountTxsWithTransfers(signal),
    ...queryOptions,
  }) as UseQueryResult<AddressTransactionsWithTransfersListResponse, Error>;
}
