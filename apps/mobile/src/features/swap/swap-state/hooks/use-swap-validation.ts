import { useMemo } from 'react';

import { Money } from '@leather.io/models';

import { DerivedAmounts, SwapInternalState } from '../swap-state.types';
import { runValidation } from '../validation/swap-validation';

interface UseSwapValidationParams {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
  spendableAmount: Money | null;
}

export function useSwapValidation({
  state,
  derivedAmounts,
  spendableAmount,
}: UseSwapValidationParams) {
  return useMemo(
    () => runValidation({ state, derivedAmounts, spendableAmount }),
    [state, derivedAmounts, spendableAmount]
  );
}
