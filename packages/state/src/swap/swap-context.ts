import { createContext, useContext } from 'react';

import { type UseSwapStateResult } from './swap-state.types';

export const SwapContext = createContext<UseSwapStateResult | null>(null);

export function useSwapContext(): UseSwapStateResult {
  const context = useContext(SwapContext);
  if (!context) throw new Error('useSwapContext must be used within SwapProvider');
  return context;
}
