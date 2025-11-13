import BigNumber from 'bignumber.js';

export function calculatePoolUnderlyingTokenBalance(
  lpTokenBalance: BigNumber,
  underlyingTokenBalance: BigNumber,
  totalLpShares: BigNumber
): BigNumber {
  return lpTokenBalance.multipliedBy(underlyingTokenBalance).dividedBy(totalLpShares);
}
