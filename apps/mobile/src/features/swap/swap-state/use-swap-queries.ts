import { useMemo } from 'react';

import type { AccountRequest, MarketDataService, SwapService } from '@leather.io/services';

import {
  createAccountBaseSwapAssetsQuery,
  createAccountTargetSwapAssetsQuery,
  createAssetMarketDataQuery,
} from './swap.queries';

interface UseSwapQueriesArgs {
  swapService: SwapService;
  marketDataService: MarketDataService;
  accountRequest: AccountRequest;
}

interface UseSwapQueriesResult {
  useAccountBaseSwapAssetsQuery: ReturnType<typeof createAccountBaseSwapAssetsQuery>;
  useAccountTargetSwapAssetsQuery: ReturnType<typeof createAccountTargetSwapAssetsQuery>;
  useAssetMarketDataQuery: ReturnType<typeof createAssetMarketDataQuery>;
}

export function useSwapQueries({
  swapService,
  marketDataService,
  accountRequest,
}: UseSwapQueriesArgs): UseSwapQueriesResult {
  return useMemo(() => {
    return {
      useAccountBaseSwapAssetsQuery: createAccountBaseSwapAssetsQuery(swapService, accountRequest),
      useAccountTargetSwapAssetsQuery: createAccountTargetSwapAssetsQuery(
        swapService,
        accountRequest
      ),
      useAssetMarketDataQuery: createAssetMarketDataQuery(marketDataService),
    };
  }, [accountRequest, swapService, marketDataService]);
}
