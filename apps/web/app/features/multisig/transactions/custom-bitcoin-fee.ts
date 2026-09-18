export function parseCustomBitcoinFeeRate(input: string): number | undefined {
  const value = input.trim();
  if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) return undefined;
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate <= 0 || rate > Number.MAX_SAFE_INTEGER) return undefined;
  return rate;
}
