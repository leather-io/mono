import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { StacksQueryPrefixes } from '../../../query-prefixes';
import { type StacksClient, useStacksClient } from '../../stacks-client';
import { FtAssetResponse } from '../token-metadata.utils';

const staleTime = 12 * 60 * 60 * 1000;

const queryOptions = {
  gcTime: staleTime,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,
  staleTime,
} as const;

interface CreateGetFungibleTokenMetadataQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetFungibleTokenMetadataQueryOptions({
  address,
  client,
  network,
}: CreateGetFungibleTokenMetadataQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetFtMetadata, address, network],
    queryFn: ({ signal }: QueryFunctionContext) =>
      client.getFtMetadata(address, signal) as unknown as FtAssetResponse,
    ...queryOptions,
  } as const;
}

export function useGetFungibleTokenMetadataQuery(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery(
    createGetFungibleTokenMetadataQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    })
  );
}
