import { SecondaryAmount, SwapInternalState } from '@/features/swap/swap-state/swap-state.types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { Money } from '@leather.io/models';

interface ComputeSecondaryAmountStateParams {
  state: SwapInternalState;
  queryStatus: 'pending' | 'success' | 'error';
  isFetching: boolean;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function computeSecondaryAmountState({
  state,
  queryStatus,
  isFetching,
  derivedAmounts,
}: ComputeSecondaryAmountStateParams): SecondaryAmount {
  if (!state.baseSwapAsset) {
    return { status: 'idle', value: null };
  }

  if (queryStatus === 'pending') {
    return { status: 'pending', value: null };
  }

  const secondaryValue = whenInputCurrencyMode(state.inputCurrencyMode)({
    crypto: derivedAmounts.quote,
    quote: derivedAmounts.crypto,
  });

  if (queryStatus === 'error' || (queryStatus === 'success' && secondaryValue === null)) {
    return { status: 'error', value: null };
  }

  if (queryStatus === 'success' && secondaryValue !== null) {
    return { status: 'success', value: secondaryValue, isFetching };
  }

  return { status: 'idle', value: null };
}
