import { ClarityType, ClarityValue } from '@stacks/transactions';

const maxFeeBips = 10_000;

export interface Pox5PoolFee {
  activeFeeBips: number;
  pendingFeeBips: number | null;
  pendingActivationCycle: number | null;
}

export function decodeFeeBips(value: ClarityValue): number | null {
  if (value.type !== ClarityType.UInt) return null;
  const bips = Number(value.value);
  if (bips < 0 || bips >= maxFeeBips) return null;
  return bips;
}

export function poolFeeFromBips(activeFeeBips: number): Pox5PoolFee {
  return { activeFeeBips, pendingFeeBips: null, pendingActivationCycle: null };
}

export function decodePendingFees(value: ClarityValue): Pox5PoolFee | null {
  if (value.type !== ClarityType.Tuple) return null;

  const activeValue = value.value['active-bips'];
  const pendingValue = value.value['pending-bips'];
  const activationCycleValue = value.value['activation-cycle'];
  if (!activeValue || !pendingValue || !activationCycleValue) return null;

  const activeFeeBips = decodeFeeBips(activeValue);
  if (activeFeeBips === null) return null;

  const pendingFeeBips = decodeFeeBips(pendingValue);
  if (
    pendingFeeBips === null ||
    pendingFeeBips === activeFeeBips ||
    activationCycleValue.type !== ClarityType.UInt
  ) {
    return poolFeeFromBips(activeFeeBips);
  }

  return {
    activeFeeBips,
    pendingFeeBips,
    pendingActivationCycle: Number(activationCycleValue.value),
  };
}

export function getExpectedFeeBips(fee: Pox5PoolFee): number {
  return fee.pendingFeeBips ?? fee.activeFeeBips;
}

export function formatFeeBips(bips: number): string {
  return `${Number((bips / 100).toFixed(2))}%`;
}
