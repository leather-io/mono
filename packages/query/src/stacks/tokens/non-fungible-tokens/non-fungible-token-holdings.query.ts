import { useQuery } from '@tanstack/react-query';
import PQueue from 'p-queue';

// import { logger } from '@shared/logger';
import type { Paginated } from '../../../../types/api-types';
import { useCurrentNetworkState } from '../../../leather-query-provider';
import { QueryPrefixes } from '../../../query-prefixes';
import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { StacksClient, useStacksClient } from '../../stacks-client';

const staleTime = 15 * 60 * 1000; // 15 min

interface NonFungibleTokenHoldingListResult {
  asset_identifier: string;
  value: {
    hex: string;
    repr: string;
  };
  block_height: number;
  tx_id: string;
}

const queryOptions = { cacheTime: staleTime, staleTime, refetchhOnFocus: false } as const;

type FetchNonFungibleTokenHoldingsResp = Paginated<NonFungibleTokenHoldingListResult[]>;

function fetchNonFungibleTokenHoldings(client: StacksClient, limiter: PQueue) {
  return async (address: string) => {
    if (!address) return;
    return limiter.add(
      () =>
        client.nonFungibleTokensApi.getNftHoldings({
          principal: address,
          limit: 50,
        }) as unknown as Promise<FetchNonFungibleTokenHoldingsResp>,
      {
        throwOnTimeout: true,
      }
    );
  };
}

function makeNonFungibleTokenHoldingsQuery(
  address: string,
  network: string,
  client: StacksClient,
  limiter: PQueue
) {
  if (address === '') {
    // logger.warn('No address passed to ' + QueryPrefixes.GetNftHoldings);
  }
  return {
    enabled: !!address,
    queryKey: [QueryPrefixes.GetNftHoldings, address, network],
    queryFn: () => fetchNonFungibleTokenHoldings(client, limiter)(address),
    ...queryOptions,
  };
}

export function useGetNonFungibleTokenHoldingsQuery(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();
  const limiter = useHiroApiRateLimiter();

  return useQuery(
    makeNonFungibleTokenHoldingsQuery(address, network.chain.stacks.url, client, limiter)
  );
}
