import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { StacksQueryPrefixes } from '../../query-prefixes';
import { StacksClient, useStacksClient } from '../stacks-client';
import { fetchNamesForAddress } from './bns.utils';

const staleTime = 24 * 60 * 60 * 1000; // 24 hours

const queryOptions = {
  gcTime: Infinity,
  staleTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
} as const;

interface CreateGetBnsNamesOwnedByAddressQueryOptionsArgs {
  address: string;
  client: StacksClient;
  isTestnet: boolean;
}
export function createGetBnsNamesOwnedByAddressQueryOptions({
  address,
  client,
  isTestnet,
}: CreateGetBnsNamesOwnedByAddressQueryOptionsArgs) {
  return {
    enabled: address !== '',
    queryKey: [StacksQueryPrefixes.GetBnsNamesByAddress, address],
    queryFn: async ({ signal }: QueryFunctionContext) =>
      fetchNamesForAddress({ client, address, isTestnet, signal }),
    ...queryOptions,
  } as const;
}

export function useGetBnsNamesOwnedByAddressQuery(address: string) {
  const client = useStacksClient();
  const { isTestnet } = useCurrentNetworkState();

  return useQuery(createGetBnsNamesOwnedByAddressQueryOptions({ address, client, isTestnet }));
}
