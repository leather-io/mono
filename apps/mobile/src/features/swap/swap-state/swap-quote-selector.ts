import {
  EnrichedSwapQuote,
  SwapQuoteSelectionResult,
  SwapQuoteStrategy,
} from '@/features/swap/swap-state/swap-state.types';
import { calculatePriceImpactPercentage } from '@/features/swap/swap-state/swap-state.utils';
import BigNumber from 'bignumber.js';
import { filter, isDefined, map, pipe, prop, sortBy } from 'remeda';

import { SwapDex, SwapExecutionType, SwapQuote } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export function swapQuoteSelector(
  swapQuotes: SwapQuote[],
  strategy: SwapQuoteStrategy,
  fairMarketRate: number | null
): SwapQuoteSelectionResult {
  const quotes = pipe(
    swapQuotes,
    map(swapQuote => {
      const selector = selectors[swapQuote.executionType];
      if (!selector) return;
      return selector(swapQuote, fairMarketRate);
    }),
    filter(isDefined),
    sortBy([prop('score'), 'desc'])
  );

  const selected = selectQuoteByStrategy(quotes, strategy);

  return {
    quotes,
    selected,
  };
}

// Quote selection isn't currently exposed to users, is hardcoded to 'best', and returns the highest ranking quote (largest receive amount).
// The hardcoded implementation is a placeholder to make the future addition or quote selection easier.
function selectQuoteByStrategy(
  quotes: EnrichedSwapQuote[],
  strategy: SwapQuoteStrategy
): EnrichedSwapQuote | undefined {
  if (quotes.length === 0) return;

  switch (strategy) {
    case 'best':
      return quotes[0];
    case 'fastest':
      return quotes[0];
    case 'cheapest':
      return quotes[0];
    default:
      return assertUnreachable(strategy);
  }
}

type QuoteSelector = (swapQuotes: SwapQuote, fairMarketRate: number | null) => EnrichedSwapQuote;

const selectors: Record<SwapExecutionType, QuoteSelector> = {
  'stacks-contract-call': stacksContractCallSelector,
  'sbtc-bridge-transfer': sbtcBridgeTransferSelector,
};

function stacksContractCallSelector(
  swapQuote: SwapQuote,
  fairMarketRate: number | null
): EnrichedSwapQuote {
  const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
  return {
    rawSwapQuote: swapQuote,
    dexPath: swapQuote.dexPath,
    assetPath: swapQuote.assetPath,
    quoteAmount: swapQuote.quote,
    provider: swapQuote.providerId,
    providerFee: estimateLiquidityFeePercentage(swapQuote.dexPath),
    rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
    score: swapQuote.targetAmount,
    priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
  };
}

function sbtcBridgeTransferSelector(
  swapQuote: SwapQuote,
  fairMarketRate: number | null
): EnrichedSwapQuote {
  const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
  return {
    rawSwapQuote: swapQuote,
    dexPath: swapQuote.dexPath,
    assetPath: swapQuote.assetPath,
    quoteAmount: swapQuote.quote,
    provider: swapQuote.providerId,
    rate: estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount),
    score: swapQuote.targetAmount,
    priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
  };
}

function estimateLiquidityFeePercentage(dexPath: SwapDex[]) {
  const perDexFeePercentage = 0.003;
  return new BigNumber(dexPath.length).times(perDexFeePercentage).toNumber();
}

function estimateExchangeRate(baseAmount: number, targetAmount: number): number {
  const base = new BigNumber(baseAmount);
  if (base.isZero()) return 0;
  return new BigNumber(targetAmount).div(base).toNumber();
}
