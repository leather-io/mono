import { BnsNamesOwnByAddressResponse } from '@stacks/stacks-blockchain-api-types';
import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { AppUseQueryConfig } from '../../query-config';
import { QueryPrefixes } from '../../query-prefixes';
import { useStacksClient } from '../stacks-client';
import { fetchNamesForAddress } from './bns.utils';

const staleTime = 24 * 60 * 60 * 1000; // 24 hours

const bnsQueryOptions = {
  cacheTime: Infinity,
  staleTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
} as const;

export function useGetBnsNamesOwnedByAddressQuery<T extends unknown = BnsNamesOwnByAddressResponse>(
  address: string,
  options?: AppUseQueryConfig<BnsNamesOwnByAddressResponse, T>
) {
  const client = useStacksClient();
  const { isTestnet } = useCurrentNetworkState();

  return useQuery({
    enabled: address !== '',
    queryKey: [QueryPrefixes.BnsNamesByAddress, address],
    queryFn: async ({ signal }) => fetchNamesForAddress({ client, address, isTestnet, signal }),
    ...bnsQueryOptions,
    ...options,
  });
}
