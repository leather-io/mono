import { contractPrincipalCV, noneCV, serializeCV, uintCV } from '@stacks/transactions';
import { getStackingDaoWrapperContract } from '~/data/bitcoin-staking-data';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { parseContractId } from '../utils/contract-id';
import { ClaimStakerRewardsArgs, getClaimStakerRewardsOptions } from './pox5-claim-rewards';
import { StakeArgs, getStakeOptions } from './pox5-stake';
import { StakeUpdateArgs, getStakeUpdateOptions } from './pox5-stake-update';
import { UnstakeArgs, getUnstakeOptions } from './pox5-unstake';

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
