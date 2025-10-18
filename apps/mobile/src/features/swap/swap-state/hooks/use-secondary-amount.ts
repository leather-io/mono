import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';
import { UseQueryResult } from '@tanstack/react-query';

import { Money } from '@leather.io/models';

import { SecondaryAmount, SwapInternalState } from '../swap-state.types';

interface UseSecondaryAmountParams {
  state: SwapInternalState;
  baseMarketDataQuery: UseQueryResult<unknown>;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function useSecondaryAmount({
  state,
  baseMarketDataQuery,
  derivedAmounts,
}: UseSecondaryAmountParams): SecondaryAmount {
  if (!state.baseSwapAsset) {
    return { status: 'idle', value: null };
  }

  if (baseMarketDataQuery.status === 'pending') {
    return { status: 'pending', value: null };
  }

  const secondaryValue = whenInputCurrencyMode(state.inputCurrencyMode)({
    crypto: derivedAmounts.quote,
    quote: derivedAmounts.crypto,
  });

  if (
    baseMarketDataQuery.status === 'error' ||
    (baseMarketDataQuery.status === 'success' && secondaryValue === null)
  ) {
    return { status: 'error', value: null };
  }

  if (baseMarketDataQuery.status === 'success' && secondaryValue !== null) {
    return { status: 'success', value: secondaryValue, isFetching: baseMarketDataQuery.isFetching };
  }

  return { status: 'idle', value: null };
}
