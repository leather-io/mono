import { createContext, useContext } from 'react';

import type { MarketData, Money } from '@leather.io/models';

export type FeePriority = 'slow' | 'standard' | 'fast' | 'custom';

export interface Fee {
  priority: FeePriority;
  feeRate?: number;
  feeValue?: number;
  txFee: Money;
  time: string;
}

export type Fees = Record<FeePriority, Fee>;
export type FeeType = 'fee-rate' | 'fee-value';

interface FeeEditorContext {
  availableBalance: Money;
  customFee: string;
  feeType: FeeType;
  loadedFee: Fee;
  isLoadingFees: boolean;
  isSponsored: boolean;
  marketData: MarketData;
  fees: Fees;
  selectedFee: Fee;
  getCustomFee(this: void, rate: number): Fee;
  onGoBack(this: void): void;
  onSetCustomFee(this: void, value: string | null): void;
  onSetLoadedFee(this: void, value: Fee): void;
  onSetSelectedFee(this: void, value: Fee): void;
  onUserActivatesFeeEditor(this: void): void;
}

export const feeEditorContext = createContext<FeeEditorContext | null>(null);

export function useFeeEditorContext() {
  const context = useContext(feeEditorContext);
  if (!context) throw new Error('`useFeeEditorContext` must be used within a `FeeEditorProvider`');
  return context;
}
