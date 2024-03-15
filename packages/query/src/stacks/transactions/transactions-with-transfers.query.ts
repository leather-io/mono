import { DEFAULT_LIST_LIMIT } from '@leather-wallet/constants';
import { AddressTransactionsWithTransfersListResponse } from '@stacks/stacks-blockchain-api-types';
import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { useHiroApiRateLimiter } from '../rate-limiter';
import { useStacksClient } from '../stacks-client';

const queryOptions: UseQueryOptions = {
  staleTime: 60 * 1000,
  refetchInterval: 30_000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
};

export function useGetAccountTransactionsWithTransfersQuery({
  stacksAddress,
}: {
  stacksAddress: string;
}) {
  const { chain } = useCurrentNetworkState();
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function fetchAccountTxsWithTransfers() {
    if (!stacksAddress) return;
    await limiter.removeTokens(1);
    return client.accountsApi.getAccountTransactionsWithTransfers({
      principal: stacksAddress,
      limit: DEFAULT_LIST_LIMIT,
    });
  }

  return useQuery({
    queryKey: ['account-txs-with-transfers', stacksAddress, chain.stacks.url],
    queryFn: fetchAccountTxsWithTransfers,
    enabled: !!stacksAddress && !!chain.stacks.url,
    ...queryOptions,
  }) as UseQueryResult<AddressTransactionsWithTransfersListResponse, Error>;
}
