import BigNumber from 'bignumber.js';

import { Money } from '@leather.io/models';

export function formatLockedBalance(balance: Money) {
  if (!balance || !balance.amount || !balance.decimals) return undefined;

  const amount = new BigNumber(balance.amount).dividedBy(new BigNumber(10).pow(balance.decimals));
  return amount.toFixed().replace(/\.?0+$/, '');
}
