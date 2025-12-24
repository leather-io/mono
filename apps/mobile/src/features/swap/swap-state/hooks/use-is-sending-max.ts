import { DerivedAmounts } from '@/features/swap/swap-state/swap-state.types';

import { Money } from '@leather.io/models';

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
