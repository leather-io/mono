import type { QueryFunctionContext } from '@tanstack/react-query';

import { NetworkModes } from '@leather.io/models';
import { isUndefined } from '@leather.io/utils';

import { BnsV2QueryPrefixes } from '../../query-prefixes';
import { BnsV2Client } from './bns-v2-client';
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
  address?: string;
  network: NetworkModes;
  client: BnsV2Client;
}

export function createGetBnsNamesOwnedByAddressQueryOptions({
  address,
  network,
  client,
}: CreateGetBnsNamesOwnedByAddressQueryOptionsArgs) {
  return {
    enabled: !isUndefined(address),
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [BnsV2QueryPrefixes.GetBnsNamesByAddress, address],
    queryFn: async ({ signal }: QueryFunctionContext) => {
      if (isUndefined(address)) return { names: [] };
      return fetchNamesForAddress({ address, network, signal, client });
    },
    ...queryOptions,
  } as const;
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
