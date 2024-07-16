import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';

const queryOptions = {
  staleTime: 60 * 1000,
  refetchInterval: 30_000,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: true,
} as const;

interface CreateGetAccountTransactionsWithTransfersQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetAccountTransactionsWithTransfersQueryOptions({
  address,
  client,
  network,
}: CreateGetAccountTransactionsWithTransfersQueryOptionsArgs) {
  return {
    enabled: !!address && !!network,
    queryKey: [StacksQueryPrefixes.GetAccountTxsWithTransfers, address, network],
    queryFn: ({ signal }: QueryFunctionContext) =>
      client.getAccountTransactionsWithTransfers(address, signal),
    ...queryOptions,
  } as const;
}

export function useGetAccountTransactionsWithTransfersQuery(address: string) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();

  return useQuery(
    createGetAccountTransactionsWithTransfersQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    })
  );
}
