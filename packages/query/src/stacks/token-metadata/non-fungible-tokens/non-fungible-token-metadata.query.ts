import { getPrincipalFromContractId } from '@leather-wallet/utils';
import { hexToCV } from '@stacks/transactions';
import { type UseQueryResult, useQueries } from '@tanstack/react-query';

import { useHiroApiRateLimiter } from '../../../hiro-rate-limiter';
import { QueryPrefixes } from '../../../query-prefixes';
import { useStacksClient } from '../../stacks-client';
import type { NftAssetResponse } from '../token-metadata.utils';
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

function statusCodeNotFoundOrNotProcessable(status: number) {
  return status === 404 || status === 422;
}

export function useGetNonFungibleTokenMetadataListQuery(
  address: string
): UseQueryResult<NftAssetResponse>[] {
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();
  const nftHoldings = useGetNonFungibleTokenHoldingsQuery(address);

  return useQueries({
    queries: (nftHoldings.data?.results ?? []).map(nft => {
      const principal = getPrincipalFromContractId(nft.asset_identifier);
      const tokenId = getTokenId(nft.value.hex);

      return {
        enabled: !!tokenId,
        queryKey: [QueryPrefixes.GetNftMetadata, principal, tokenId],
        queryFn: async () => {
          return limiter.add(() => client.tokensApi.getNftMetadata(principal, tokenId), {
            throwOnTimeout: true,
          });
        },
        retry(_count: number, error: Response) {
          if (statusCodeNotFoundOrNotProcessable(error.status)) return false;
          return true;
        },
        ...queryOptions,
      };
    }),
  });
}
