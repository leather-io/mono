import { QueryFunctionContext, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { oneWeekInMs } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { StacksQueryPrefixes } from '../../../query-prefixes';
import { StacksClient, useStacksClient } from '../../stacks-client';
import { FtAssetResponse } from '../token-metadata.utils';

const queryOptions = {
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  staleTime: oneWeekInMs,
  gcTime: Infinity,
  retry: 0,
} satisfies Partial<UseQueryOptions>;

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
    queryFn: async ({ signal }: QueryFunctionContext) => {
      try {
        const res = await client.getFtMetadata(address, signal);
        return res as unknown as FtAssetResponse;
      } catch (error) {
        const status = (error as AxiosError).request?.status;
        if (status === 404 || status === 422) return null;
        throw error;
      }
    },
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
