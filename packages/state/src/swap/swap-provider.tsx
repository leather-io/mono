import { type ReactNode } from 'react';

import { type QuoteCurrency, type SwappableFungibleCryptoAsset } from '@leather.io/models';

import { SwapContext } from './swap-context';
import { type DisabledPairRule, type SwapDependencies, type TrackEvent } from './swap-state.types';
import { useSwapState } from './use-swap-state';

export interface SwapProviderProps {
  children: ReactNode;
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  quoteCurrencyPreference: QuoteCurrency;
  dependencies: SwapDependencies;
  disabledPairs?: DisabledPairRule[];
  trackEvent: TrackEvent;
}

export function SwapProvider({
  children,
  baseAsset,
  targetAsset,
  quoteCurrencyPreference,
  dependencies,
  disabledPairs,
  trackEvent,
}: SwapProviderProps) {
  const value = useSwapState({
    baseAsset,
    targetAsset,
    quoteCurrencyPreference,
    dependencies,
    disabledPairs,
    trackEvent,
  });

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}
