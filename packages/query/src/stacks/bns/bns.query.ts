import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { NetworkModes } from '@leather.io/models';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { StacksQueryPrefixes } from '../../query-prefixes';
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
  network: NetworkModes;
}
export function createGetBnsNamesOwnedByAddressQueryOptions({
  address,
  network,
}: CreateGetBnsNamesOwnedByAddressQueryOptionsArgs) {
  return {
    enabled: address !== '',
    queryKey: [StacksQueryPrefixes.GetBnsNamesByAddress, address],
    queryFn: async ({ signal }: QueryFunctionContext) =>
      fetchNamesForAddress({ address, network, signal }),
    ...queryOptions,
  } as const;
}

export function useGetBnsNamesOwnedByAddressQuery(address: string) {
  const { mode } = useCurrentNetworkState();

  return useQuery(createGetBnsNamesOwnedByAddressQueryOptions({ address, network: mode }));
}
