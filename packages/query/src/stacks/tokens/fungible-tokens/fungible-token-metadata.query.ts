import { UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

import { useCurrentNetworkState } from '../../../leather-query-provider';
import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useTokenMetadataClient } from '../../stacks-client';
import { TokenMetadataClient } from '../../token-metadata-client';
import { FtAssetResponse } from '../token-metadata.utils';

const staleTime = 12 * 60 * 60 * 1000;

const queryOptions = {
  keepPreviousData: true,
  cacheTime: staleTime,
  staleTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  retry: 0,
} as const;

function fetchFungibleTokenMetadata(client: TokenMetadataClient, limiter: PQueue) {
  return (principal: string) => async () => {
    return limiter.add(() => client.tokensApi.getFtMetadata(principal), {
      throwOnTimeout: true,
    });
  };
}

export function useGetFungibleTokenMetadataQuery(
  principal: string
): UseQueryResult<FtAssetResponse> {
  const client = useTokenMetadataClient();
  const network = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQuery({
    queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
    queryFn: fetchFungibleTokenMetadata(client, limiter)(principal),
    ...queryOptions,
  });
}

export function useGetFungibleTokenMetadataListQuery(
  principals: string[]
): UseQueryResult<FtAssetResponse>[] {
  const client = useTokenMetadataClient();
  const network = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQueries({
    queries: principals.map(principal => ({
      queryKey: ['get-ft-metadata', principal, network.chain.stacks.url],
      queryFn: fetchFungibleTokenMetadata(client, limiter)(principal),
      ...queryOptions,
    })),
  });
}
