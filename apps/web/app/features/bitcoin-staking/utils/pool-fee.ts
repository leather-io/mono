import { ClarityType, ClarityValue } from '@stacks/transactions';

const maxFeeBips = 10_000;

export function decodeFeeBips(value: ClarityValue): number | null {
  if (value.type !== ClarityType.UInt) return null;
  const bips = Number(value.value);
  if (bips < 0 || bips >= maxFeeBips) return null;
  return bips;
}

export function formatFeeBips(bips: number): string {
  return `${Number((bips / 100).toFixed(2))}%`;
}
