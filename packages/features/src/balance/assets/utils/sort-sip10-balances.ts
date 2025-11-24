import { Sip10Balance } from '@leather.io/services';

export function sortSip10Balances(a: Sip10Balance, b: Sip10Balance) {
  return b.quote.availableBalance.amount.minus(a.quote.availableBalance.amount).toNumber();
}
