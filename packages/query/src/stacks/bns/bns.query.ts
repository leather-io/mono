import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { NetworkModes } from '@leather.io/models';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { BnsV2QueryPrefixes } from '../../query-prefixes';
import { BnsV2Client, useBnsV2Client } from './bns-v2-client';
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
  client: BnsV2Client;
}

export function createGetBnsNamesOwnedByAddressQueryOptions({
  address,
  network,
  client,
}: CreateGetBnsNamesOwnedByAddressQueryOptionsArgs) {
  return {
    enabled: address !== '',
    queryKey: [BnsV2QueryPrefixes.GetBnsNamesByAddress, address],
    queryFn: async ({ signal }: QueryFunctionContext) =>
      fetchNamesForAddress({ address, network, signal, client }),
    ...queryOptions,
  } as const;
}

export function useGetBnsNamesOwnedByAddressQuery(address: string) {
  const { mode } = useCurrentNetworkState();
  const client = useBnsV2Client();

  return useQuery(createGetBnsNamesOwnedByAddressQueryOptions({ address, network: mode, client }));
}

interface CreateGetBnsV2ZoneFileDataQueryOptionsArgs {
  bnsName: string;
  client: BnsV2Client;
}
export function createGetBnsV2ZoneFileDataQueryOptions({
  bnsName,
  client,
}: CreateGetBnsV2ZoneFileDataQueryOptionsArgs) {
  return {
    queryKey: [BnsV2QueryPrefixes.GetBnsV2ZoneFileData, bnsName],
    queryFn: async ({ signal }: QueryFunctionContext) => client.getZoneFileData(bnsName, signal),
    ...queryOptions,
  } as const;
}

export function useGetBnsV2ZoneFileDataQuery(bnsName: string) {
  const client = useBnsV2Client();
  return useQuery(createGetBnsV2ZoneFileDataQueryOptions({ bnsName, client }));
}
