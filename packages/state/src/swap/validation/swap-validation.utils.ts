import { isString } from 'remeda';

import { type Money } from '@leather.io/models';
import { countDecimals } from '@leather.io/utils';

export function isParsableNumber(value: string) {
  const numericValue = parseFloat(value);
  return !isNaN(numericValue) && isFinite(numericValue);
}

export function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (isString(value)) return value.trim().length > 0;
  return true;
}

export function hasValidPrecision(value: string, maxDecimals: number): boolean {
  return countDecimals(value) <= maxDecimals;
}

export function isWithinRange(input: number, min: number, max: number) {
  if (min > max) [min, max] = [max, min];
  return input >= min && input <= max;
}

export function isAmountWithinBalance(amount: Money, spendableBalance: Money): boolean {
  return amount.amount.isLessThanOrEqualTo(spendableBalance.amount);
}
