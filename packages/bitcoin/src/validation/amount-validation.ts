import { Money } from '@leather.io/models';

export const minSpendAmountInSats = 546;

interface isBtcBalanceSufficientParams {
  desiredSpend: Money;
  maxSpend: Money;
}
export function isBtcBalanceSufficient({ desiredSpend, maxSpend }: isBtcBalanceSufficientParams) {
  return !desiredSpend.amount.isGreaterThan(maxSpend.amount);
}

export function isBtcMinimumSpend(desiredSpend: Money) {
  return !desiredSpend.amount.isLessThan(minSpendAmountInSats);
}
