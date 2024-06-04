import { Money } from '@leather-wallet/models';
import BigNumber from 'bignumber.js';

import { isObject } from '..';

export function isMoney(val: unknown): val is Money {
  if (!isObject(val)) return false;
  return 'amount' in val && 'symbol' in val && 'decimals' in val;
}

export function isMoneyGreaterThanZero(money: Money) {
  if (!BigNumber.isBigNumber(money.amount)) return;
  return !(money.amount.isNaN() || money.amount.isZero());
}
