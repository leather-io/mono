import BigNumber from 'bignumber.js';

interface cyclesToUntilBurnHeightArgs {
  /**
   * Duration in number of cycles from the `currentCycleId`.
   */
  cycles: number;

  /**
   * Number of blocks per cycle.
   */
  rewardCycleLength: number;

  /**
   * ID of the current cycle.
   */
  currentCycleId: number;

  /**
   * Height of burn chain when first cycle began.
   */
  firstBurnchainBlockHeight: number;
}

/**
 * Using a duration expressed in cycles and cycle parameters, calculates the
 * burn chain height after the cycles have elapsed.
 */
export function cyclesToBurnChainHeight(args: cyclesToUntilBurnHeightArgs) {
  const { cycles, rewardCycleLength, firstBurnchainBlockHeight, currentCycleId } = args;
  return new BigNumber(firstBurnchainBlockHeight)
    .plus(new BigNumber(currentCycleId).plus(1).multipliedBy(rewardCycleLength))
    .plus(new BigNumber(cycles).multipliedBy(rewardCycleLength))
    .toNumber();
}
