import { ClarityValue, noneCV, principalCV, serializeCV, uintCV } from '@stacks/transactions';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { analytics } from '~/utils/analytics/analytics';
import { StxCallContractParams } from '~/utils/leather-sdk';

import { LeatherSdk } from '@leather.io/sdk';

// Claims target the pool's signer-manager contract, not pox-5, and are
// per-cycle: claiming several cycles means one transaction each. The staker
// principal is explicit because the contract allows anyone to trigger a claim
// on a staker's behalf. bond-index is always none — BTC protocol bonds are out
// of scope for v1.
interface ClaimStakerRewardsArgs {
  signerManagerContractId: string;
  stakerAddress: string;
  rewardCycle: number;
}

export function getClaimStakerRewardsOptions(
  args: ClaimStakerRewardsArgs & { network: string }
): StxCallContractParams {
  const { signerManagerContractId, stakerAddress, rewardCycle, network } = args;

  if (!Number.isInteger(rewardCycle) || rewardCycle < 0) {
    throw new Error('Expected rewardCycle to be a non-negative integer.');
  }

  const functionArgs: ClarityValue[] = [principalCV(stakerAddress), uintCV(rewardCycle), noneCV()];

  return {
    contract: signerManagerContractId,
    functionName: 'claim-staker-rewards',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // The sBTC here moves FROM the signer-manager TO the sender; the sender
    // moves nothing. Originator mode (epoch 4.0) enforces coverage only for
    // the sender's own assets, so no post-conditions are needed while still
    // rejecting any unexpected movement of the sender's funds. An exact FT
    // post-condition is not possible client-side: the claimable amount net of
    // pool fees is only known at execution.
    postConditionMode: 'originator',
  } satisfies StxCallContractParams;
}

interface ClaimRewardsMutationValues extends ClaimStakerRewardsArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateClaimRewardsMutationOptionsArgs {
  leather: LeatherSdk;
}

export function createClaimRewardsMutationOptions({
  leather,
}: CreateClaimRewardsMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-claim-rewards', leather],
    mutationFn: async (values: ClaimRewardsMutationValues) => {
      const options = getClaimStakerRewardsOptions({
        signerManagerContractId: values.signerManagerContractId,
        stakerAddress: values.stakerAddress,
        rewardCycle: values.rewardCycle,
        network: pox5NetworkConfig.walletRpcNetwork,
      });

      analytics.track('bitcoin_staking_rewards_claimed', {
        provider: values.providerId,
        rewardCycle: values.rewardCycle,
      });

      return leather.stxCallContract(options);
    },
  } as const;
}
