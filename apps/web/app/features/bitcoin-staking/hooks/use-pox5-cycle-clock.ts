import { usePox5CoreInfoQuery, usePox5PoxInfoQuery } from '../queries/pox5-node.query';
import {
  CycleClockInfo,
  estimateDateFromBurnBlocks,
  getCycleClockInfo,
  getUnlockBurnHeight,
} from '../utils/pox5-cycle-clock';

interface Pox5CycleClock {
  clock: CycleClockInfo;
  currentBurnHeight: number;
  estimatedUnlockDateForCycles(cycles: number, now: Date): Date;
}

interface UsePox5CycleClockResult {
  isLoading: boolean;
  cycleClock: Pox5CycleClock | null;
}

export function usePox5CycleClock(): UsePox5CycleClockResult {
  const poxInfoQuery = usePox5PoxInfoQuery();
  const coreInfoQuery = usePox5CoreInfoQuery();

  const poxInfo = poxInfoQuery.data;
  const currentBurnHeight =
    coreInfoQuery.data?.burn_block_height ?? poxInfo?.current_burnchain_block_height;

  if (!poxInfo || currentBurnHeight === undefined) {
    return {
      isLoading: poxInfoQuery.isLoading || coreInfoQuery.isLoading,
      cycleClock: null,
    };
  }

  const clock = getCycleClockInfo({
    currentBurnHeight,
    firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
    rewardCycleLength: poxInfo.reward_cycle_length,
    preparePhaseLength: poxInfo.prepare_phase_block_length,
  });

  return {
    isLoading: false,
    cycleClock: {
      clock,
      currentBurnHeight,
      estimatedUnlockDateForCycles(cycles: number, now: Date) {
        const unlockBurnHeight = getUnlockBurnHeight({
          numCycles: cycles,
          currentCycleId: clock.currentCycleId,
          rewardCycleLength: poxInfo.reward_cycle_length,
          firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
        });
        return estimateDateFromBurnBlocks(unlockBurnHeight - currentBurnHeight, now);
      },
    },
  };
}
