import BigNumber from 'bignumber.js';

import { type Money, type NumType } from '@leather.io/models';

export function isMoney(val: Money | NumType) {
  return typeof val === 'object' && 'amount' in val && 'symbol' in val && 'decimals' in val;
}

export function isMoneyGreaterThanZero(money: Money) {
  if (!BigNumber.isBigNumber(money.amount)) return;
  return !(money.amount.isNaN() || money.amount.isZero());
}
