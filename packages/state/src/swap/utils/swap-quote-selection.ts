import BigNumber from 'bignumber.js';
import { filter, isDefined, map, pipe, prop, sortBy } from 'remeda';

import { type SwapQuote } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { getExecutionTypeStrategy } from '../strategies/execution-type/execution-type';
import {
  type EnrichedSwapQuote,
  type SwapQuotePolicy,
  type SwapQuoteSelectionResult,
} from '../swap-state.types';

export function swapQuoteSelector(
  swapQuotes: SwapQuote[],
  policy: SwapQuotePolicy,
  fairMarketRate: BigNumber | null,
  slippage: number
): SwapQuoteSelectionResult {
  const allQuotes = pipe(
    swapQuotes,
    map(swapQuote => {
      const enricher = getExecutionTypeStrategy(swapQuote.executionType).enrichQuote;
      return enricher(swapQuote, fairMarketRate, slippage);
    }),
    filter(isDefined),
    sortBy([prop('score'), 'desc'])
  );

  const executableQuotes = allQuotes.filter(quote => quote.isExecutable);
  const selected = selectQuoteByPolicy(executableQuotes, policy);

  if (selected) {
    return { quotes: allQuotes, selected };
  }

  const bestNonExecutable = allQuotes.find(quote => !quote.isExecutable);
  const unmetConstraints = bestNonExecutable?.executionConstraints ?? [];

  return { quotes: allQuotes, selected: undefined, unmetConstraints };
}

function selectQuoteByPolicy(
  quotes: EnrichedSwapQuote[],
  policy: SwapQuotePolicy
): EnrichedSwapQuote | undefined {
  if (quotes.length === 0) return;

  switch (policy) {
    case 'best':
      return quotes[0];
    case 'fastest':
      return quotes[0];
    case 'cheapest':
      return quotes[0];
    default:
      return assertUnreachable(policy);
  }
}
