export function sortByBlockHeight(a: { blockHeight: number }, b: { blockHeight: number }) {
  return b.blockHeight - a.blockHeight;
}

const lpTokenPatterns = [
  '::pool-token-id',
  '::lp-token',
  '::liquidity-token',
  '.dlmm-pool-',
  '.amm-pool-',
];

export function isLpToken(assetIdentifier: string): boolean {
  const lowerIdentifier = assetIdentifier.toLowerCase();
  return lpTokenPatterns.some(pattern => lowerIdentifier.includes(pattern));
}
