import { getProtocolStrategy } from '@/features/swap/swap-state/strategies/protocol/protocol';
import { DerivedAmounts } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';

import { AccountSwapAsset } from '@leather.io/services';

interface UseIsSendingMaxParams {
  derivedAmounts: DerivedAmounts;
  baseSwapAsset: AccountSwapAsset | null;
  inputCurrencyMode: InputCurrencyMode;
}

export function useIsSendingMax({ derivedAmounts, baseSwapAsset }: UseIsSendingMaxParams) {
  if (!baseSwapAsset?.balance || !derivedAmounts.crypto) return false;

  const spendableBalance = getProtocolStrategy(baseSwapAsset.asset.protocol).resolveSpendableAmount(
    baseSwapAsset.balance.crypto
  );

  return derivedAmounts.crypto.amount.isEqualTo(spendableBalance.amount);
}
