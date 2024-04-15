import { pullContractIdFromIdentity } from '@leather-wallet/utils';
import { hexToCV } from '@stacks/transactions';
import { UseQueryResult, useQueries } from '@tanstack/react-query';

import type { StacksAccount } from '../../../../types/stacks-account';
import { QueryPrefixes } from '../../../query-prefixes';
import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useTokenMetadataClient } from '../../stacks-client';
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
        queryFn: async () => {
          return limiter.add(() => client.tokensApi.getNftMetadata(principal, tokenId), {
            throwOnTimeout: true,
          });
        },
        ...queryOptions,
      };
    }),
  });
}
