import { abbreviateNumber } from '../../abbreviate-number/abbreviate-number';
import { removeCommas } from './remove-commas';

/**
 * TODO: investigate improving
 * @param amount is a string
 * in the extension we pre-convert it from Money with formatMoneyWithoutSymbol
 */
export function formatBalance(amount: string) {
  if (typeof amount !== 'string' || amount.trim() === '' || isNaN(Number(removeCommas(amount)))) {
    throw new Error('Invalid input: amount must be a non-empty string representing a valid number');
  }

  const noCommas = removeCommas(amount);
  const number = parseFloat(noCommas);
  return number > 10000
    ? {
        isAbbreviated: true,
        value: abbreviateNumber(number),
      }
    : { isAbbreviated: false, value: amount };
}
