import { contractPrincipalCV, noneCV, serializeCV, uintCV } from '@stacks/transactions';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { parseContractId } from '../utils/contract-id';
import { ClaimStakerRewardsArgs, getClaimStakerRewardsOptions } from './pox5-claim-rewards';
import { StakeArgs, getStakeOptions } from './pox5-stake';
import { StakeUpdateArgs, getStakeUpdateOptions } from './pox5-stake-update';
import { UnstakeArgs, getUnstakeOptions } from './pox5-unstake';

// Stacking DAO is the one pool that cannot be staked against pox-5 directly:
// its signer-manager's validate-stake! only passes while their native-pool
// wrapper holds a transient is-delegating flag, so stake/stake-update/unstake
// must be sent to the wrapper as delegate/delegate-update/undelegate (same
// trailing args; delegate drops start-burn-ht and signer-calldata, which the
// wrapper supplies itself). Their claim-staker-rewards is also non-standard:
// it takes no staker principal and always claims for tx-sender. Everything
// about this bespoke flow is keyed off the map below; no other pool should
// ever be added here.
const stackingDaoWrapperBySignerManager: Record<string, string> = {
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager':
    'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-v1',
};

export function getStackingDaoWrapperContract(signerManagerContractId: string): string | undefined {
  return stackingDaoWrapperBySignerManager[signerManagerContractId];
}

export function isStackingDaoSignerManager(signerManagerContractId: string): boolean {
  return signerManagerContractId in stackingDaoWrapperBySignerManager;
}

export function isStackingDaoWrapperContract(contractId: string): boolean {
  return Object.values(stackingDaoWrapperBySignerManager).includes(contractId);
}

function requireStackingDaoWrapperContract(signerManagerContractId: string): string {
  const wrapperContractId = getStackingDaoWrapperContract(signerManagerContractId);
  if (!wrapperContractId) {
    throw new Error(`No Stacking DAO wrapper contract for ${signerManagerContractId}.`);
  }
  return wrapperContractId;
}

export function getStackingDaoStakeOptions(
  args: StakeArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  if (args.payoutPreference) {
    throw new Error('Payout preference is not supported when staking with Stacking DAO.');
  }
  const wrapperContractId = requireStackingDaoWrapperContract(args.signerManagerContractId);
  const signerManager = parseContractId(args.signerManagerContractId);
  const functionArgs = [
    contractPrincipalCV(signerManager.contractAddress, signerManager.contractName),
    uintCV(args.amountMicroStx),
    uintCV(args.numCycles),
  ];

  return {
    ...getStakeOptions(args),
    contract: wrapperContractId,
    functionName: 'delegate',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
  };
}

export function getStackingDaoStakeUpdateOptions(
  args: StakeUpdateArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  if (args.payoutPreference) {
    throw new Error('Payout preference is not supported when staking with Stacking DAO.');
  }
  return {
    ...getStakeUpdateOptions(args),
    contract: requireStackingDaoWrapperContract(args.newSignerManagerContractId),
    functionName: 'delegate-update',
  };
}

export function getStackingDaoUnstakeOptions(
  args: UnstakeArgs & { pox5ContractId: string; network: string }
): StxCallContractParams {
  return {
    ...getUnstakeOptions(args),
    contract: requireStackingDaoWrapperContract(args.currentSignerManagerContractId),
    functionName: 'undelegate',
  };
}

export function getStackingDaoClaimStakerRewardsOptions(
  args: ClaimStakerRewardsArgs & { network: string }
): StxCallContractParams {
  const functionArgs = [uintCV(args.rewardCycle), noneCV()];

  return {
    ...getClaimStakerRewardsOptions(args),
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
  };
}
