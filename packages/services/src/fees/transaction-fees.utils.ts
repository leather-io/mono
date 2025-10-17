import { BigNumber } from 'bignumber.js';

export function calculateFeeRate(fee: number, estimatedTxSize: number) {
  return Math.ceil(new BigNumber(fee).dividedBy(estimatedTxSize).toNumber());
}

export function enforceFeeBounds(fee: number, minimum: number, maximum: number): number {
  return enforceFeeMinimum(enforceFeeMaximum(fee, maximum), minimum);
}

export function enforceFeeMinimum(fee: number, minimum: number): number {
  return Math.max(minimum, fee);
}

export function enforceFeeMaximum(fee: number, maximum: number): number {
  return Math.min(maximum, fee);
}
