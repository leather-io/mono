import { type Money } from '@leather.io/models';

import { type DerivedAmounts } from '../swap-state.types';

interface UseIsSendingMaxParams {
  derivedAmounts: DerivedAmounts;
  spendableAmount: Money | null;
}

export function useIsSendingMax({
  derivedAmounts,
  spendableAmount,
}: UseIsSendingMaxParams): boolean {
  if (!spendableAmount || !derivedAmounts.crypto) return false;
  return derivedAmounts.crypto.amount.isEqualTo(spendableAmount.amount);
}
