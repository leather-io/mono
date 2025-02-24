import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';
import { btcToSat } from '@leather.io/utils';

export const minSpendAmountInSats = 546;

interface isBtcBalanceSufficientArgs {
  amount: Money;
  spendable: Money;
}
export function isBtcBalanceSufficient({
  amount: { amount },
  spendable: { amount: spendableAmount },
}: isBtcBalanceSufficientArgs) {
  if (!spendableAmount) return false;
  const desiredSpend = new BigNumber(amount);
  const availableAmount = new BigNumber(spendableAmount);
  if (desiredSpend.isGreaterThan(availableAmount)) return false;
  return true;
}

interface IsBtcMinimumSpendArgs {
  amount: Money;
}
export function isBtcMinimumSpend({ amount: { amount } }: IsBtcMinimumSpendArgs) {
  if (!amount) return false;

  const desiredSpend = btcToSat(amount);
  if (desiredSpend.isLessThan(minSpendAmountInSats)) return false;
  return true;
}
