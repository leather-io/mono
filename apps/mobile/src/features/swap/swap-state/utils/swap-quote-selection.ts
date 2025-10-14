import { getExecutionTypeStrategy } from '@/features/swap/swap-state/strategies/execution-type/execution-type';
import {
  EnrichedSwapQuote,
  SwapQuoteSelectionResult,
  SwapQuoteStrategy,
} from '@/features/swap/swap-state/swap-state.types';
import { filter, isDefined, map, pipe, prop, sortBy } from 'remeda';

import { SwapQuote } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

export function swapQuoteSelector(
  swapQuotes: SwapQuote[],
  strategy: SwapQuoteStrategy,
  fairMarketRate: number | null,
  slippage: number
): SwapQuoteSelectionResult {
  const quotes = pipe(
    swapQuotes,
    map(swapQuote => {
      const enricher = getExecutionTypeStrategy(swapQuote.executionType).enrichQuote;
      return enricher(swapQuote, fairMarketRate, slippage);
    }),
    filter(isDefined),
    sortBy([prop('score'), 'desc'])
  );

  return {
    quotes,
    selected: selectQuoteByStrategy(quotes, strategy),
  };
}

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
