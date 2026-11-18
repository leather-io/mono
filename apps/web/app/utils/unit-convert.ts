import BigNumber from 'bignumber.js';

import { initBigNumber, microStxToStx } from '@leather.io/utils';

function parseNumber(num: string | number | BigNumber | bigint) {
  const n = typeof num === 'bigint' ? num.toString() : num;
  return new BigNumber(n);
}

export function toHumanReadableMicroStx(
  microStx: string | number | bigint | BigNumber,
  decimalPlaces?: number
): string {
  const amount = microStxToStx(initBigNumber(microStx));
  return amount.toFormat(decimalPlaces) + ' STX';
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

export function toHumanReadablePercent(amount: bigint | string | number | BigNumber): string {
  return parseNumber(amount).toFixed(2) + '%';
}
