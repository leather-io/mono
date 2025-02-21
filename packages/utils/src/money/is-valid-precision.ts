import { isNumber } from '../index';
import { countDecimals } from '../math';

export function isValidPrecision(amount: number, precision: number) {
  if (!isNumber(amount)) return false;
  return countDecimals(amount) <= precision;
}
