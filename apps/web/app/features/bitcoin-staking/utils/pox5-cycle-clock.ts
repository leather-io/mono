import { MEAN_BURN_BLOCK_SECONDS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { cyclesToBurnChainHeight } from '~/utils/calculate-burn-height';

interface CycleClockParams {
  currentBurnHeight: number;
  firstBurnchainBlockHeight: number;
  rewardCycleLength: number;
  preparePhaseLength: number;
}

export interface CycleClockInfo {
  currentCycleId: number;
  isInPreparePhase: boolean;
  blocksUntilPreparePhase: number;
  blocksUntilStakingReopens: number;
  secondsUntilStakingReopens: number;
}

// Derived from burn height rather than trusting the pox-info convenience
// fields, so the same math drives display, submit gating, and the mutation
// pre-checks deterministically.
export function getCycleClockInfo(params: CycleClockParams): CycleClockInfo {
  const { currentBurnHeight, firstBurnchainBlockHeight, rewardCycleLength, preparePhaseLength } =
    params;
  const elapsed = currentBurnHeight - firstBurnchainBlockHeight;
  const currentCycleId = Math.floor(elapsed / rewardCycleLength);
  const positionInCycle = elapsed % rewardCycleLength;
  const preparePhaseStart = rewardCycleLength - preparePhaseLength;
  const isInPreparePhase = positionInCycle >= preparePhaseStart;
  const blocksUntilPreparePhase = isInPreparePhase ? 0 : preparePhaseStart - positionInCycle;
  const blocksUntilStakingReopens = isInPreparePhase ? rewardCycleLength - positionInCycle : 0;

  return {
    currentCycleId,
    isInPreparePhase,
    blocksUntilPreparePhase,
    blocksUntilStakingReopens,
    secondsUntilStakingReopens: blocksUntilStakingReopens * MEAN_BURN_BLOCK_SECONDS,
  };
}

// The pox-5 contract rejects a start-burn-ht that does not resolve to the next
// reward cycle, so callers must pass a freshly fetched burn height, never one
// from a cached query snapshot.
export function getStakeStartBurnHeight(currentBurnHeight: number): number {
  return currentBurnHeight;
}

interface GetUnlockBurnHeightArgs {
  numCycles: number;
  currentCycleId: number;
  rewardCycleLength: number;
  firstBurnchainBlockHeight: number;
}

export function getUnlockBurnHeight(args: GetUnlockBurnHeightArgs): number {
  return cyclesToBurnChainHeight({
    cycles: args.numCycles,
    currentCycleId: args.currentCycleId,
    rewardCycleLength: args.rewardCycleLength,
    firstBurnchainBlockHeight: args.firstBurnchainBlockHeight,
  });
}

export function estimateDateFromBurnBlocks(blocksFromNow: number, now: Date): Date {
  return new Date(now.getTime() + blocksFromNow * MEAN_BURN_BLOCK_SECONDS * 1000);
}

interface PoxInfoCycleFields {
  current_burnchain_block_height?: number;
  first_burnchain_block_height: number;
  reward_cycle_length: number;
  prepare_phase_block_length: number;
}

interface CycleContext {
  currentBurnHeight: number;
  clock: CycleClockInfo;
}

export function getCycleContextFromPoxInfo(poxInfo: PoxInfoCycleFields): CycleContext {
  const currentBurnHeight = poxInfo.current_burnchain_block_height;
  if (currentBurnHeight === undefined) {
    throw new Error('Expected pox info to include the current burn height.');
  }
  return {
    currentBurnHeight,
    clock: getCycleClockInfo({
      currentBurnHeight,
      firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
      rewardCycleLength: poxInfo.reward_cycle_length,
      preparePhaseLength: poxInfo.prepare_phase_block_length,
    }),
  };
}
