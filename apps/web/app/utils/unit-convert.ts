import BigNumber from 'bignumber.js';

import { initBigNumber, microStxToStx } from '@leather.io/utils';

export function parseNumber(num: string | number | BigNumber | bigint) {
  const n = typeof num === 'bigint' ? num.toString() : num;
  return new BigNumber(n);
}

/**
 *
 * @param microStx amount of micro stacks
 * @returns the amount as stacks amount rounded to the lower number.
 */
export function microStxToStxRounded(microStx: string | number | bigint | BigNumber): BigNumber {
  const amount = parseNumber(typeof microStx === 'bigint' ? microStx.toString() : microStx);
  if (!amount.isInteger()) throw new Error('Micro STX can only be represented as integers');
  return amount.dividedToIntegerBy(10 ** 6);
}

export function toHumanReadableMicroStx(
  microStx: string | number | bigint | BigNumber,
  decimalPlaces?: number
): string {
  const amount = microStxToStx(initBigNumber(microStx));
  return amount.toFormat(decimalPlaces) + ' STX';
}

export function toHumanReadableStx(
  stx: string | number | bigint | BigNumber,
  decimalPlaces?: number
): string {
  const amount = initBigNumber(stx);
  return amount.toFormat(decimalPlaces) + ' STX';
}

export function toHumanReadableShortMicroStx(
  microStx: string | number | bigint | BigNumber
): string {
  const stx = parseNumber(microStx).dividedBy(1e6);

  return toHumanReadableShortStx(stx);
}

export function toHumanReadableShortStx(userStx: string | number | bigint | BigNumber): string {
  const stx = parseNumber(userStx);
  if (stx.lt(1e6)) {
    return `${stx.toFixed(0)} STX`;
  }
  if (stx.lt(1e9)) {
    return `${stx.dividedBy(1e6).toFixed(2)}M STX`;
  }
  return `${stx.dividedBy(1e9).toFixed(2)}B STX`;
}

// Max U128 is too large for BigNumber
export function stxToMicroStxBigint(stx: bigint | string | number): string {
  return parseNumber(stx).shiftedBy(6).decimalPlaces(0).toString(10);
}

// Max U128 is too large for BigNumber
export function microStxToStxBigint(microStx: bigint | string | number): string {
  return parseNumber(microStx).shiftedBy(-6).decimalPlaces(6).toString(10);
}

export function daysToWeek(daysNumber: bigint | string | number | BigNumber) {
  return Number(parseNumber(daysNumber).dividedBy(7).toFixed(0));
}

export function toHumanReadableDays(daysNumber: number): string {
  const parsedDaysNumber = parseNumber(daysNumber);

  return (
    parseNumber(parsedDaysNumber).toFixed(0, BigNumber.ROUND_CEIL) +
    ' day' +
    (parsedDaysNumber.gt(1) ? 's' : '')
  );
}

export function toHumanReadableWeeks(weeksNumber: number): string {
  const parsedWeekNumber = parseNumber(weeksNumber);
  return parsedWeekNumber.toFixed(0) + ' week' + (parsedWeekNumber.gt(1) ? 's' : '');
}

export function toHumanReadablePercent(amount: bigint | string | number | BigNumber): string {
  return parseNumber(amount).toFixed(2) + '%';
}
