import { useMemo } from 'react';

import { Money } from '@leather.io/models';

import { SwapInternalState } from '../swap-state.types';
import { runValidation } from '../validation/swap-validation';

interface UseSwapValidationParams {
  state: SwapInternalState;
  derivedAmounts: { crypto: Money | null; quote: Money | null };
}

export function useSwapValidation({ state, derivedAmounts }: UseSwapValidationParams) {
  return useMemo(() => runValidation({ state, derivedAmounts }), [state, derivedAmounts]);
}
