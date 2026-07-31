import { usePox5CycleClock } from '../../hooks/use-pox5-cycle-clock';
import { Pox5Position, usePox5Position } from '../../hooks/use-pox5-position';
import {
  usePox5PoxInfoQuery,
  usePox5SecondsUntilNextCycleQuery,
} from '../../queries/pox5-node.query';
import {
  Pox5ClaimableRewards,
  usePox5ClaimableRewards,
  usePox5PayoutPreferenceQuery,
} from '../../queries/pox5-stacking.query';
import { Pox5PayoutPreference } from '../../transactions/pox5-signer-calldata';
import { estimateDateFromBurnBlocks } from '../../utils/pox5-cycle-clock';

export interface ActiveStakingDetails {
  endCycle: number;
  unlockDate: Date | null;
  isInPreparePhase: boolean;
  secondsUntilStakingReopens: number;
  nextCycleNumber: number | null;
  daysUntilNextCycle: number | null;
  claimable: Pox5ClaimableRewards;
  payoutPreference: Pox5PayoutPreference | null;
}

interface UseActiveStakingInfoResult {
  isLoading: boolean;
  position: Pox5Position;
  details: ActiveStakingDetails | null;
}

// The pox-5 replacement for use-active-pool-info: everything derives from the
// on-chain staker info instead of delegation-status transaction parsing.
export function useActiveStakingInfo(): UseActiveStakingInfoResult {
  const { isLoading: positionIsLoading, position } = usePox5Position();
  const { cycleClock } = usePox5CycleClock();
  const claimable = usePox5ClaimableRewards();
  const poxInfoQuery = usePox5PoxInfoQuery();
  const secondsUntilNextCycleQuery = usePox5SecondsUntilNextCycleQuery();

  const signerManagerContractId =
    position.status === 'active' ? position.info.signerManagerContractId : undefined;
  const payoutPreferenceQuery = usePox5PayoutPreferenceQuery(signerManagerContractId);

  if (position.status !== 'active') {
    return { isLoading: positionIsLoading, position, details: null };
  }

  const poxInfo = poxInfoQuery.data;
  const endCycle = position.info.firstRewardCycle + position.info.numCycles;

  const unlockDate = (() => {
    if (!poxInfo || !cycleClock) return null;
    const unlockBurnHeight =
      poxInfo.first_burnchain_block_height + endCycle * poxInfo.reward_cycle_length;
    return estimateDateFromBurnBlocks(unlockBurnHeight - cycleClock.currentBurnHeight, new Date());
  })();

  return {
    isLoading: positionIsLoading,
    position,
    details: {
      endCycle,
      unlockDate,
      isInPreparePhase: cycleClock?.clock.isInPreparePhase ?? false,
      secondsUntilStakingReopens: cycleClock?.clock.secondsUntilStakingReopens ?? 0,
      nextCycleNumber: poxInfo?.next_cycle.id ?? null,
      daysUntilNextCycle:
        secondsUntilNextCycleQuery.data !== undefined
          ? Math.round(secondsUntilNextCycleQuery.data / (60 * 60 * 24))
          : null,
      claimable,
      payoutPreference: payoutPreferenceQuery.data ?? null,
    },
  };
}
