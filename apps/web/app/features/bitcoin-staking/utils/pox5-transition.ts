import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import { Pox5Status } from './pox5-activation';

export type Pox5TransitionPhase =
  | 'pox4-only'
  | 'pre-activation'
  | 'activation-cycle'
  | 'needs-restake'
  | 'pox5-steady-state';

interface GetPox5TransitionPhaseArgs {
  pox5Status: Pox5Status;
  currentBurnHeight: number;
  pox4Stacked: boolean;
  lockedMicroStx: bigint;
  pox5StakerInfo: Pox5StakerInfo | null;
  rewardCycleLength: number;
  firstBurnchainBlockHeight: number;
}

function cycleIdAtHeight(
  burnHeight: number,
  firstBurnchainBlockHeight: number,
  rewardCycleLength: number
): number {
  return Math.floor((burnHeight - firstBurnchainBlockHeight) / rewardCycleLength);
}

// Deliberately simple heuristic; SIP V2 is expected to publish concrete wallet
// migration guidance that will refine the needs-restake detection.
export function getPox5TransitionPhase(args: GetPox5TransitionPhaseArgs): Pox5TransitionPhase {
  const {
    pox5Status,
    currentBurnHeight,
    pox4Stacked,
    lockedMicroStx,
    pox5StakerInfo,
    rewardCycleLength,
    firstBurnchainBlockHeight,
  } = args;

  if (pox5Status.status === 'not-configured') return 'pox4-only';
  if (pox5Status.status === 'pre-activation') return 'pre-activation';

  const activationCycle = cycleIdAtHeight(
    pox5Status.activationBurnHeight,
    firstBurnchainBlockHeight,
    rewardCycleLength
  );
  const currentCycle = cycleIdAtHeight(
    currentBurnHeight,
    firstBurnchainBlockHeight,
    rewardCycleLength
  );

  if (currentCycle <= activationCycle) return 'activation-cycle';
  if (pox5StakerInfo !== null) return 'pox5-steady-state';
  if (pox4Stacked || lockedMicroStx > 0n) return 'needs-restake';
  return 'pox5-steady-state';
}
