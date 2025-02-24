import { hexToCV } from '@stacks/transactions';
import { QueryFunctionContext, type UseQueryResult, useQueries } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { oneWeekInMs } from '@leather.io/utils';

import { StacksQueryPrefixes } from '../../../query-prefixes';
import { StacksClient, useStacksClient } from '../../stacks-client';
import type { NftAssetResponse } from '../token-metadata.utils';
import { useGetNonFungibleTokenHoldingsQuery } from './non-fungible-token-holdings.query';

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  staleTime: oneWeekInMs,
  gcTime: Infinity,
} as const;

function getTokenId(hex: string) {
  const clarityValue = hexToCV(hex);
  return clarityValue.type === 'uint' ? Number(clarityValue.value) : 0;
}

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

export function useGetNonFungibleTokenMetadataListQuery(
  address: string
): UseQueryResult<NftAssetResponse>[] {
  const client = useStacksClient();
  const nftHoldings = useGetNonFungibleTokenHoldingsQuery(address);

  return useQueries({
    queries: (nftHoldings.data?.results ?? []).map(nft => {
      const address = getPrincipalFromAssetString(nft.asset_identifier);
      const tokenId = getTokenId(nft.value.hex);

      return {
        ...createGetNonFungibleTokenMetadataQueryOptions({
          address,
          client,
          tokenId,
        }),
      };
    }),
  });
}
