import { StackingClient } from '@stacks/stacking';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { analytics } from '~/utils/analytics/analytics';
import { StxCallContractParams } from '~/utils/leather-sdk';
import { WalletTransactionResult } from '~/utils/wallet';

import { getPox5ContractId } from '../utils/pox5-contracts';
import { getCycleContextFromPoxInfo, getStakeStartBurnHeight } from '../utils/pox5-cycle-clock';
import { getPoolContractData } from './pool-contract-data';
import { ClaimStakerRewardsArgs } from './pox5-claim-rewards';
import { Pox5PayoutPreference } from './pox5-signer-calldata';
import { StakeUpdateArgs } from './pox5-stake-update';
import { UnstakeArgs } from './pox5-unstake';

interface StakingWallet {
  stxCallContract(params: StxCallContractParams): Promise<WalletTransactionResult>;
}

interface StakeMutationValues {
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  amountMicroStx: bigint;
  numCycles: number;
  payoutPreference?: Pox5PayoutPreference;
}

interface CreateStakeMutationOptionsArgs {
  wallet: StakingWallet;
  client: StackingClient;
}

export function createStakeMutationOptions({ wallet, client }: CreateStakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake', wallet, client],
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

      return wallet.stxCallContract(options);
    },
  } as const;
}

interface StakeUpdateMutationValues extends StakeUpdateArgs {
  providerId: BitcoinStakingProviderId;
  targetProviderId: BitcoinStakingProviderId;
}

interface CreateStakeUpdateMutationOptionsArgs {
  wallet: StakingWallet;
  client: StackingClient;
}

export function createStakeUpdateMutationOptions({
  wallet,
  client,
}: CreateStakeUpdateMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-stake-update', wallet, client],
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

      const isSwitching =
        values.newSignerManagerContractId !== values.currentSignerManagerContractId;

      analytics.track('bitcoin_staking_updated', {
        provider: values.providerId,
        amountIncreaseMicroStx: values.amountIncreaseMicroStx.toString(),
        cyclesToExtend: values.cyclesToExtend,
        ...(isSwitching
          ? {
              switchedFromProvider: values.providerId,
              switchedToProvider: values.targetProviderId,
            }
          : {}),
      });

      return wallet.stxCallContract(options);
    },
  } as const;
}

interface UnstakeMutationValues extends UnstakeArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateUnstakeMutationOptionsArgs {
  wallet: StakingWallet;
  client: StackingClient;
}

export function createUnstakeMutationOptions({ wallet, client }: CreateUnstakeMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-unstake', wallet, client],
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

      return wallet.stxCallContract(options);
    },
  } as const;
}

interface ClaimRewardsMutationValues extends ClaimStakerRewardsArgs {
  providerId: BitcoinStakingProviderId;
}

interface CreateClaimRewardsMutationOptionsArgs {
  wallet: StakingWallet;
}

export function createClaimRewardsMutationOptions({
  wallet,
}: CreateClaimRewardsMutationOptionsArgs) {
  return {
    mutationKey: ['pox5-claim-rewards', wallet],
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

      return wallet.stxCallContract(options);
    },
  } as const;
}
