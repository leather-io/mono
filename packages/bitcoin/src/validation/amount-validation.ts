import BigNumber from 'bignumber.js';

import { btcToSat } from '@leather.io/utils';

export const minSpendAmountInSats = 546;

interface isBtcBalanceSufficientArgs {
  amount: number;
  spendableBtc: BigNumber;
}
export function isBtcBalanceSufficient({ amount, spendableBtc }: isBtcBalanceSufficientArgs) {
  if (!spendableBtc) return false;
  const desiredSpend = new BigNumber(amount);
  if (desiredSpend.isGreaterThan(spendableBtc)) return false;
  return true;
}

interface isBtcMinimumSpendArgs {
  amount: number;
}
export function isBtcMinimumSpend({ amount }: isBtcMinimumSpendArgs) {
  if (!amount) return false;

  const desiredSpend = btcToSat(amount);
  if (desiredSpend.isLessThan(minSpendAmountInSats)) return false;
  return true;
}
