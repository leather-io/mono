import type { QueryFunctionContext } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { oneWeekInMs } from '@leather.io/utils';

import { StacksQueryPrefixes } from '../../../query-prefixes';
import { StacksClient } from '../../stacks-client';

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  staleTime: oneWeekInMs,
  gcTime: Infinity,
} as const;

function statusCodeNotFoundOrNotProcessable(status: number) {
  return status === 404 || status === 422;
}

interface CreateGetNonFungibleTokenMetadataQueryOptionsArgs {
  address: string;
  client: StacksClient;
  tokenId: number;
}
export function createGetNonFungibleTokenMetadataQueryOptions({
  address,
  client,
  tokenId,
}: CreateGetNonFungibleTokenMetadataQueryOptionsArgs) {
  const queryKey = [StacksQueryPrefixes.GetNftMetadata, address, tokenId];

  return {
    enabled: !!tokenId,
    queryKey,
    queryFn: async ({ signal }: QueryFunctionContext) => {
      try {
        return await client.getNftMetadata(address, tokenId, signal);
      } catch (error) {
        if (statusCodeNotFoundOrNotProcessable((error as AxiosError).request.status)) return null;

        throw error;
      }
    },
    retry(_count: number, error: AxiosError) {
      if (statusCodeNotFoundOrNotProcessable(error.request.status)) return false;
      return true;
    },
    ...queryOptions,
  } as const;
}
