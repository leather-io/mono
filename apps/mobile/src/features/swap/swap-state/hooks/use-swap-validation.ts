import { useMemo } from 'react';

import { DerivedAmounts, SwapInternalState } from '../swap-state.types';
import { runValidation } from '../validation/swap-validation';

interface UseSwapValidationParams {
  state: SwapInternalState;
  derivedAmounts: DerivedAmounts;
}

export function useSwapValidation({ state, derivedAmounts }: UseSwapValidationParams) {
  return useMemo(() => runValidation({ state, derivedAmounts }), [state, derivedAmounts]);
}
