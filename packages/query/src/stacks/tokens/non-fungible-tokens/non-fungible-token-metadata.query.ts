import { pullContractIdFromIdentity } from '@leather-wallet/utils';
import { hexToCV } from '@stacks/transactions';
import { UseQueryResult, useQueries } from '@tanstack/react-query';

import type { StacksAccount } from '../../../../types/stacks-account';
import { QueryPrefixes } from '../../../query-prefixes';
import { RateLimiter, useHiroApiRateLimiter } from '../../rate-limiter';
import { useTokenMetadataClient } from '../../stacks-client';
import { TokenMetadataClient } from '../../token-metadata-client';
import { NftAssetResponse } from '../token-metadata.utils';
import { useGetNonFungibleTokenHoldingsQuery } from './non-fungible-token-holdings.query';

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  staleTime: 10 * 1000,
};

function getTokenId(hex: string) {
  const clarityValue = hexToCV(hex);
  return clarityValue.type === 1 ? Number(clarityValue.value) : 0;
}

function fetchNonFungibleTokenMetadata(client: TokenMetadataClient, limiter: RateLimiter) {
  return (principal: string, tokenId: number) => async () => {
    await limiter.removeTokens(1);
    return client.tokensApi.getNftMetadata(principal, tokenId);
  };
}

export function useGetNonFungibleTokenMetadataListQuery(
  account: StacksAccount
): UseQueryResult<NftAssetResponse>[] {
  const client = useTokenMetadataClient();
  const limiter = useHiroApiRateLimiter();
  const nftHoldings = useGetNonFungibleTokenHoldingsQuery(account.address);

  return useQueries({
    queries: (nftHoldings.data?.results ?? []).map(nft => {
      const principal = pullContractIdFromIdentity(nft.asset_identifier);
      const tokenId = getTokenId(nft.value.hex);

      return {
        enabled: !!tokenId,
        queryKey: [QueryPrefixes.GetNftMetadata, principal, tokenId],
        queryFn: fetchNonFungibleTokenMetadata(client, limiter)(principal, tokenId),
        ...queryOptions,
      };
    }),
  });
}
