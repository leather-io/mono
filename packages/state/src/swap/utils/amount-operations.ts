import BigNumber from 'bignumber.js';

import { type Money } from '@leather.io/models';

import { type PresetPercentage } from '../swap-state.types';

export function calculatePercentageAmount(
  total: Money | undefined,
  percentage: PresetPercentage
): string {
  if (!total) return '0';

  return total.amount
    .multipliedBy(BigNumber(percentage))
    .shiftedBy(-total.decimals)
    .toFixed(total.decimals, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

export function isUserInputEffectivelyZero(input: string) {
  return parseFloat(input) === 0;
}

export function convertMoneyToInputValue(money: Money | null): string {
  if (!money) return '';
  return money.amount
    .shiftedBy(-money.decimals)
    .toFixed(money.decimals, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}
