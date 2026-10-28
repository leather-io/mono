import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';

import { oneWeekInMs } from '@leather.io/utils';

import { StacksQueryPrefixes } from '../../../query-prefixes';
import { type StacksClient } from '../../stacks-client';
import { getRequestErrorStatus } from '../request-error.utils';
import { type FtAssetResponse } from '../token-metadata.utils';

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
    async queryFn({ signal }: QueryFunctionContext) {
      try {
        const res: FtAssetResponse = await client.getFtMetadata(address, signal);
        return res;
      } catch (error) {
        const status = getRequestErrorStatus(error);
        if (status === 404 || status === 422) return null;
        throw error;
      }
    },
    ...queryOptions,
  } as const;
}
