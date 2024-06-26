import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  staleTime: 60 * 1000,
  refetchInterval: 30_000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
};

function fetchAccountTxsWithTransfers(client: StacksClient, signal: AbortSignal) {
  return async (address: string) => client.getAccountTransactionsWithTransfers(address, signal);
}

export function useGetAccountTransactionsWithTransfersQuery(address: string) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();

  return useQuery({
    enabled: !!address && !!network.chain.stacks.url,
    queryKey: ['account-txs-with-transfers', address, network.chain.stacks.url],
    queryFn: ({ signal }) => fetchAccountTxsWithTransfers(client, signal)(address),
    ...queryOptions,
  });
}
