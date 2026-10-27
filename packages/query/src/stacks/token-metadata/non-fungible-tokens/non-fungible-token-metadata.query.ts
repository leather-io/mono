import type { QueryFunctionContext } from '@tanstack/react-query';
import { type AxiosError } from 'axios';

import { oneWeekInMs } from '@leather.io/utils';

import { StacksQueryPrefixes } from '../../../query-prefixes';
import { type StacksClient } from '../../stacks-client';
import { getRequestErrorStatus } from '../request-error.utils';

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  staleTime: oneWeekInMs,
  gcTime: Infinity,
} as const;

function statusCodeNotFoundOrNotProcessable(status: unknown) {
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
    async queryFn({ signal }: QueryFunctionContext) {
      try {
        return await client.getNftMetadata(address, tokenId, signal);
      } catch (error) {
        if (statusCodeNotFoundOrNotProcessable(getRequestErrorStatus(error))) return null;

        throw error;
      }
    },
    retry(_count: number, error: AxiosError) {
      if (statusCodeNotFoundOrNotProcessable(getRequestErrorStatus(error))) return false;
      return true;
    },
    ...queryOptions,
  } as const;
}
