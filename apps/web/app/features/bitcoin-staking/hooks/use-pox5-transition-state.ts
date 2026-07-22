import { pox5ActivationHeightOverride } from '~/data/bitcoin-staking-data';
import {
  useGetAccountExtendedBalancesQuery,
  useGetPoxInfoQuery,
  useGetStatusQuery,
} from '~/features/stacking/hooks/stacking.query';
import { useStacksNetwork } from '~/store/stacks-network';

import { usePox5StakerInfoQuery } from '../queries/pox5-stacking.query';
import { getPox5Status } from '../utils/pox5-activation';
import { Pox5TransitionPhase, getPox5TransitionPhase } from '../utils/pox5-transition';

// Only usable under StackingClientProvider with a connected wallet (the pox-4
// status queries throw otherwise); parents must gate on connection state.
export function usePox5TransitionState(): Pox5TransitionPhase | null {
  const poxInfoQuery = useGetPoxInfoQuery();
  const statusQuery = useGetStatusQuery();
  const balancesQuery = useGetAccountExtendedBalancesQuery();
  const stakerInfoQuery = usePox5StakerInfoQuery();
  const { networkInstance } = useStacksNetwork();

  const poxInfo = poxInfoQuery.data;
  if (!poxInfo || poxInfo.current_burnchain_block_height === undefined) return null;
  if (statusQuery.data === undefined || balancesQuery.data === undefined) return null;
  if (stakerInfoQuery.data === undefined) return null;

  const pox5Status = getPox5Status({
    contractVersions: poxInfo.contract_versions,
    configuredActivationHeight: pox5ActivationHeightOverride[networkInstance],
    currentBurnHeight: poxInfo.current_burnchain_block_height,
  });

  return getPox5TransitionPhase({
    pox5Status,
    currentBurnHeight: poxInfo.current_burnchain_block_height,
    pox4Stacked: statusQuery.data.stacked,
    lockedMicroStx: BigInt(balancesQuery.data.stx.locked),
    pox5StakerInfo: stakerInfoQuery.data,
    rewardCycleLength: poxInfo.reward_cycle_length,
    firstBurnchainBlockHeight: poxInfo.first_burnchain_block_height,
  });
}
