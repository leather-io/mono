import { StackingClient } from '@stacks/stacking';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { analytics } from '~/utils/analytics/analytics';

import { LeatherSdk } from '@leather.io/sdk';

import { getPox5ContractId } from '../utils/pox5-contracts';
import { getCycleContextFromPoxInfo, getStakeStartBurnHeight } from '../utils/pox5-cycle-clock';
import { getPoolContractData } from './pool-contract-data';
import { ClaimStakerRewardsArgs } from './pox5-claim-rewards';
import { Pox5PayoutPreference } from './pox5-signer-calldata';
import { StakeUpdateArgs } from './pox5-stake-update';
import { UnstakeArgs } from './pox5-unstake';

interface StakeMutationValues {
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  amountMicroStx: bigint;
  numCycles: number;
  payoutPreference?: Pox5PayoutPreference;
}

interface CreateStakeMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createStakeMutationOptions({ leather, client }: CreateStakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake', leather, client],
    mutationFn: async (values: StakeMutationValues) => {
      // Fetched at submit time: the contract rejects a start-burn-ht that does
      // not resolve to the next reward cycle, so a cached height near a cycle
      // boundary would make the transaction fail.
      const poxInfo = await client.getPoxInfo();
      const { currentBurnHeight, clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Staking is unavailable during the prepare phase.');
      }

      const options = getPoolContractData(values.signerManagerContractId).stake({
        signerManagerContractId: values.signerManagerContractId,
        amountMicroStx: values.amountMicroStx,
        numCycles: values.numCycles,
        payoutPreference: values.payoutPreference,
        startBurnHeight: getStakeStartBurnHeight(currentBurnHeight),
        pox5ContractId: getPox5ContractId(pox5NetworkConfig.contractNetworkMode),
        network: pox5NetworkConfig.walletRpcNetwork,
      });

      analytics.track('bitcoin_staking_started', {
        provider: values.providerId,
        amountMicroStx: values.amountMicroStx.toString(),
        numCycles: values.numCycles,
      });

      return leather.stxCallContract(options);
    },
  } as const;
}

interface StakeUpdateMutationValues extends StakeUpdateArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateStakeUpdateMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createStakeUpdateMutationOptions({
  leather,
  client,
}: CreateStakeUpdateMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake-update', leather, client],
    mutationFn: async (values: StakeUpdateMutationValues) => {
      const poxInfo = await client.getPoxInfo();
      const { clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Staking updates are unavailable during the prepare phase.');
      }

      const options = getPoolContractData(values.newSignerManagerContractId).stakeUpdate({
        newSignerManagerContractId: values.newSignerManagerContractId,
        currentSignerManagerContractId: values.currentSignerManagerContractId,
        cyclesToExtend: values.cyclesToExtend,
        amountIncreaseMicroStx: values.amountIncreaseMicroStx,
        currentAmountMicroStx: values.currentAmountMicroStx,
        payoutPreference: values.payoutPreference,
        pox5ContractId: getPox5ContractId(pox5NetworkConfig.contractNetworkMode),
        network: pox5NetworkConfig.walletRpcNetwork,
      });

      analytics.track('bitcoin_staking_updated', {
        provider: values.providerId,
        amountIncreaseMicroStx: values.amountIncreaseMicroStx.toString(),
        cyclesToExtend: values.cyclesToExtend,
      });

      return leather.stxCallContract(options);
    },
  } as const;
}

interface UnstakeMutationValues extends UnstakeArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateUnstakeMutationOptionsArgs {
  leather: LeatherSdk;
  client: StackingClient;
}

export function createUnstakeMutationOptions({
  leather,
  client,
}: CreateUnstakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-unstake', leather, client],
    mutationFn: async (values: UnstakeMutationValues) => {
      const poxInfo = await client.getPoxInfo();
      const { clock } = getCycleContextFromPoxInfo(poxInfo);
      if (clock.isInPreparePhase) {
        throw new Error('Unstaking is unavailable during the prepare phase.');
      }

      const options = getPoolContractData(values.currentSignerManagerContractId).unstake({
        currentSignerManagerContractId: values.currentSignerManagerContractId,
        pox5ContractId: getPox5ContractId(pox5NetworkConfig.contractNetworkMode),
        network: pox5NetworkConfig.walletRpcNetwork,
      });

      analytics.track('bitcoin_staking_unstaked', { provider: values.providerId });

      return leather.stxCallContract(options);
    },
  } as const;
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
      const options = getPoolContractData(values.signerManagerContractId).claimStakerRewards({
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
