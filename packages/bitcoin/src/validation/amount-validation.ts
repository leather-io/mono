import { BITCOIN_MINIMUM_SPEND_IN_SATS } from '@leather.io/constants';
import { Money } from '@leather.io/models';

interface isBtcBalanceSufficientParams {
  desiredSpend: Money;
  maxSpend: Money;
}
export function isBtcBalanceSufficient({ desiredSpend, maxSpend }: isBtcBalanceSufficientParams) {
  return !desiredSpend.amount.isGreaterThan(maxSpend.amount);
}

export function isBtcMinimumSpend(desiredSpend: Money) {
  return !desiredSpend.amount.isLessThan(BITCOIN_MINIMUM_SPEND_IN_SATS);
}
