import { useMemo } from 'react';

import { MarketData } from '@leather.io/models';
import { SwapService } from '@leather.io/services';

import { DerivedAmounts, SwapInternalState } from '../swap-state.types';
import { useSwapQuotesQuery } from '../swap.queries';
import { calculateFairMarketRate } from '../utils/market-rates';

interface UseSwapQuotesParams {
  swapService: SwapService;
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  baseMarketData: MarketData | undefined;
  targetMarketData: MarketData | undefined;
}

export function useSwapQuotes({
  swapService,
  state,
  derivedAmounts,
  baseMarketData,
  targetMarketData,
}: UseSwapQuotesParams) {
  const fairMarketRate = useMemo(
    () =>
      calculateFairMarketRate({
        baseMarketData,
        targetMarketData,
      }),
    [baseMarketData, targetMarketData]
  );

  const quoteQuery = useSwapQuotesQuery({
    swapService,
    baseSwapAsset: state.baseSwapAsset,
    targetSwapAsset: state.targetSwapAsset,
    baseAmount: derivedAmounts.crypto,
    strategy: state.quoteStrategy,
    slippage: state.slippage,
    fairMarketRate,
  });

  return { quoteQuery, fairMarketRate };
}
