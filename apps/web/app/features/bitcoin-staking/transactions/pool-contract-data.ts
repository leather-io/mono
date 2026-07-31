import { StxCallContractParams } from '~/utils/leather-sdk';

import { ClaimStakerRewardsArgs, getClaimStakerRewardsOptions } from './pox5-claim-rewards';
import {
  getStackingDaoClaimStakerRewardsOptions,
  getStackingDaoStakeOptions,
  getStackingDaoStakeUpdateOptions,
  getStackingDaoUnstakeOptions,
  isStackingDaoSignerManager,
} from './pox5-stacking-dao';
import { StakeArgs, getStakeOptions } from './pox5-stake';
import { StakeUpdateArgs, getStakeUpdateOptions } from './pox5-stake-update';
import { UnstakeArgs, getUnstakeOptions } from './pox5-unstake';

// Normalized transaction-building surface for a pool. Callers pick the right
// instance with getPoolContractData and stay agnostic of pool-specific call
// shapes; a pool with non-standard contracts overrides only the calls that
// differ from the direct pox-5 ones.
interface PoolContractData {
  stake(args: StakeArgs & { pox5ContractId: string; network: string }): StxCallContractParams;
  stakeUpdate(
    args: StakeUpdateArgs & { pox5ContractId: string; network: string }
  ): StxCallContractParams;
  unstake(args: UnstakeArgs & { pox5ContractId: string; network: string }): StxCallContractParams;
  claimStakerRewards(args: ClaimStakerRewardsArgs & { network: string }): StxCallContractParams;
}

export function buildPoolContractData(overrides: Partial<PoolContractData> = {}): PoolContractData {
  return {
    stake: overrides.stake ?? getStakeOptions,
    stakeUpdate: overrides.stakeUpdate ?? getStakeUpdateOptions,
    unstake: overrides.unstake ?? getUnstakeOptions,
    claimStakerRewards: overrides.claimStakerRewards ?? getClaimStakerRewardsOptions,
  };
}

const standardPoolContractData = buildPoolContractData();

const stackingDaoPoolContractData = buildPoolContractData({
  stake: getStackingDaoStakeOptions,
  stakeUpdate: getStackingDaoStakeUpdateOptions,
  unstake: getStackingDaoUnstakeOptions,
  claimStakerRewards: getStackingDaoClaimStakerRewardsOptions,
});

export function getPoolContractData(signerManagerContractId: string): PoolContractData {
  return isStackingDaoSignerManager(signerManagerContractId)
    ? stackingDaoPoolContractData
    : standardPoolContractData;
}
