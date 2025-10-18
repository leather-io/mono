import { InputCurrencyMode } from '@/utils/types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { Money } from '@leather.io/models';
import { AccountSwapAsset } from '@leather.io/services';

interface UseIsSendingMaxParams {
  derivedAmounts: { crypto: Money | null; quote: Money | null };
  baseSwapAsset: AccountSwapAsset | null;
  inputCurrencyMode: InputCurrencyMode;
}

export function useIsSendingMax({
  derivedAmounts,
  baseSwapAsset,
  inputCurrencyMode,
}: UseIsSendingMaxParams) {
  if (!baseSwapAsset?.balance) return false;

  const currentAmount = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: derivedAmounts.crypto,
    quote: derivedAmounts.quote,
  });

  if (!currentAmount) return false;

  const availableBalance = whenInputCurrencyMode(inputCurrencyMode)({
    crypto: baseSwapAsset.balance.crypto.availableBalance,
    quote: baseSwapAsset.balance.quote.availableBalance,
  });

  return currentAmount.amount.isEqualTo(availableBalance.amount);
}
