import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query';

import {
  StacksClient,
  StacksQueryPrefixes,
  useCurrentNetworkState,
  useStacksClient,
} from '@leather.io/query';

// TODO - duplicated from packages/query but to be extended and accept address array
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
