import { StackingClient } from '@stacks/stacking';
import { QueryClient } from '@tanstack/react-query';
import {
  bitcoinStakingPoolList,
  getPrimarySignerManagerContract,
  getSignerManagerContracts,
} from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import type { Pox5TrackedTx } from '~/features/bitcoin-staking/hooks/use-pox5-tx-tracker';
import { createGetPox5DelegatedAmountQueryOptions } from '~/features/bitcoin-staking/queries/create-get-pox5-delegated-amount-query-options';
import {
  type Pox5EarnedRewards,
  createGetPox5EarnedRewardsQueryOptions,
} from '~/features/bitcoin-staking/queries/create-get-pox5-earned-rewards-query-options';
import { createGetPox5PayoutPreferenceQueryOptions } from '~/features/bitcoin-staking/queries/create-get-pox5-payout-preference-query-options';
import { createGetPox5PoolFeeQueryOptions } from '~/features/bitcoin-staking/queries/create-get-pox5-pool-fee-query-options';
import {
  type Pox5StakerInfo,
  createGetPox5StakerInfoQueryOptions,
} from '~/features/bitcoin-staking/queries/create-get-pox5-staker-info-query-options';
import { createGetPox5TransactionQueryOptions } from '~/features/bitcoin-staking/queries/create-get-pox5-transaction-query-options';
import type { PendingPox5Tx } from '~/features/bitcoin-staking/queries/get-pending-pox5-txs';
import type { Pox5PayoutPreference } from '~/features/bitcoin-staking/transactions/pox5-signer-calldata';
import type { Pox5TxOutcome } from '~/features/bitcoin-staking/transactions/pox5-tx-status';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';
import type { Pox5PoolFee } from '~/features/bitcoin-staking/utils/pool-fee';
import { getPox5ContractId } from '~/features/bitcoin-staking/utils/pox5-contracts';
import { createMockGetAddressesResponse } from '~/mocks/extension/get-addresses/get-addresses.mock';
import { MEAN_BURN_BLOCK_SECONDS } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { fetchFn } from '~/utils/hiro-wrapped-fetch';

import {
  createGetCoreInfoQueryOptions,
  createGetPoxInfoQueryOptions,
  createGetSecondsUntilNextCycleQueryOptions,
  createGetStxAddressBalanceQueryOptions,
  stacksClient,
} from '@leather.io/query';

export const mockAddresses = createMockGetAddressesResponse('playground').result.addresses;

const mockStacksAddress = mockAddresses.find(address => address.symbol === 'STX')?.address ?? '';

const pox5ContractId = getPox5ContractId(pox5NetworkConfig.contractNetworkMode);

const mockStackingClient = new StackingClient({
  address: mockStacksAddress,
  network: pox5NetworkConfig.stacksNetworkName,
  client: { baseUrl: pox5NetworkConfig.apiUrl, fetch: fetchFn },
});

const mockChainStackingClient = new StackingClient({
  address: parseContractId(pox5ContractId).contractAddress,
  network: pox5NetworkConfig.stacksNetworkName,
  client: { baseUrl: pox5NetworkConfig.apiUrl, fetch: fetchFn },
});

const mockStacksClient = stacksClient(pox5NetworkConfig.apiUrl);

const firstBurnchainBlockHeight = 666_050;
const rewardCycleLength = 2_100;
const preparePhaseBlockLength = 100;
const currentCycleId = 113;

type CyclePosition = 'open' | 'closing-soon' | 'prepare-phase';

const blocksIntoCycle: Record<CyclePosition, number> = {
  open: 500,
  'closing-soon': 1_960,
  'prepare-phase': 2_050,
};

function burnHeightFor(position: CyclePosition) {
  return firstBurnchainBlockHeight + currentCycleId * rewardCycleLength + blocksIntoCycle[position];
}

function secondsUntilNextCycleFor(position: CyclePosition) {
  return (rewardCycleLength - blocksIntoCycle[position]) * MEAN_BURN_BLOCK_SECONDS;
}

function createPoxInfo(position: CyclePosition) {
  const currentBurnHeight = burnHeightFor(position);
  const blocksIntoCurrentCycle = blocksIntoCycle[position];
  const preparePhaseStart = rewardCycleLength - preparePhaseBlockLength;

  return {
    contract_id: pox5ContractId,
    pox_activation_threshold_ustx: 79_226_402_161_595,
    first_burnchain_block_height: firstBurnchainBlockHeight,
    current_burnchain_block_height: currentBurnHeight,
    prepare_phase_block_length: preparePhaseBlockLength,
    reward_phase_block_length: rewardCycleLength - preparePhaseBlockLength,
    reward_cycle_length: rewardCycleLength,
    reward_slots: 4_000,
    rejection_fraction: null,
    total_liquid_supply_ustx: 1_584_528_043_231_900,
    current_cycle: {
      id: currentCycleId,
      min_threshold_ustx: 150_000_000_000,
      stacked_ustx: 582_114_018_257_136,
      is_pox_active: true,
    },
    next_cycle: {
      id: currentCycleId + 1,
      min_threshold_ustx: 100_000_000_000,
      min_increment_ustx: 79_226_402_161,
      stacked_ustx: 22_551_795_560_392,
      prepare_phase_start_block_height:
        currentBurnHeight + (preparePhaseStart - blocksIntoCurrentCycle),
      blocks_until_prepare_phase: Math.max(0, preparePhaseStart - blocksIntoCurrentCycle),
      reward_phase_start_block_height:
        currentBurnHeight + (rewardCycleLength - blocksIntoCurrentCycle),
      blocks_until_reward_phase: rewardCycleLength - blocksIntoCurrentCycle,
      ustx_until_pox_rejection: null,
    },
  };
}

function createCoreInfo(position: CyclePosition) {
  return { burn_block_height: burnHeightFor(position) };
}

function createStxBalance(availableMicroStx: bigint, lockedMicroStx: bigint) {
  return {
    balance: (availableMicroStx + lockedMicroStx).toString(),
    total_miner_rewards_received: '0',
    lock_tx_id: '',
    locked: lockedMicroStx.toString(),
    lock_height: 0,
    burnchain_lock_height: 0,
    burnchain_unlock_height: 0,
  };
}

export const listedSignerManagerContractId =
  getPrimarySignerManagerContract('fastPool', pox5NetworkConfig.contractNetworkMode) ?? '';

export const stackingDaoSignerManagerContractId =
  getPrimarySignerManagerContract('stackingDao', pox5NetworkConfig.contractNetworkMode) ?? '';

export const byosmContractIds = {
  valid: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.community-signer-manager',
  notFound: 'SP1H1733V5MZ3SZ9XRW9FKYGEZT0JDGEB8Y634C7R.does-not-exist',
};

export const mockCurrentCycleId = currentCycleId;

interface CreateStakerInfoArgs {
  signerManagerContractId: string;
  amountMicroStx?: bigint;
  numCycles?: number;
  firstRewardCycle?: number;
}

export function createStakerInfo({
  signerManagerContractId,
  amountMicroStx = 12_500_000_000n,
  numCycles = 12,
  firstRewardCycle = currentCycleId - 3,
}: CreateStakerInfoArgs): Pox5StakerInfo {
  return {
    amountMicroStx,
    firstRewardCycle,
    numCycles,
    signerManagerContractId,
  };
}

export function createEarnedRewards(cycles: number[]): Pox5EarnedRewards[] {
  return cycles.map((cycle, index) => ({
    cycle,
    earned: BigInt(9_400 + index * 620),
    fees: BigInt(470 + index * 31),
  }));
}

export const claimableCycles = [currentCycleId - 3, currentCycleId - 2, currentCycleId - 1];

export const mockBtcPayoutPreference: Pox5PayoutPreference = {
  btcRewardAddress: 'bc1qyf4a3taahvv2sfs0zz0mtq2lxdsthmf3wcjjxq',
  maxFeeSats: 2_500n,
  minClaimSats: 5_000n,
};

const mockTxId = '0x9f3b1d2c4e5a6b7c8d9e0f1a2b3c4d5e6f70819a2b3c4d5e6f708192a3b4c5d6';

const mockPendingStakeTx: PendingPox5Tx = { kind: 'stake', txId: mockTxId };

export const mockTrackedTx: Pox5TrackedTx = {
  kind: 'stake',
  txId: mockTxId,
  destination: '/staking/pool/fast-pool/active',
  startedAt: Date.now(),
};

const mockFeeByProvider: Record<string, Pox5PoolFee> = {
  fastPool: { activeFeeBips: 0, pendingFeeBips: 450, pendingActivationCycle: 142 },
  xversePool: { activeFeeBips: 700, pendingFeeBips: null, pendingActivationCycle: null },
  special: { activeFeeBips: 300, pendingFeeBips: null, pendingActivationCycle: null },
};

const mockTotalStakedByProvider: Record<string, bigint> = {
  fastPool: 41_800_000_000_000n,
  xversePool: 12_400_000_000_000n,
  stackingDao: 128_600_000_000_000n,
  special: 900_000_000_000n,
};

export interface StakingSurfaceSeed {
  cyclePosition?: CyclePosition;
  stakerInfo?: Pox5StakerInfo | null;
  pendingTx?: PendingPox5Tx | null;
  payoutPreference?: Pox5PayoutPreference | null;
  earnedRewards?: Pox5EarnedRewards[];
  txOutcome?: Pox5TxOutcome | null;
  availableMicroStx?: bigint;
  lockedMicroStx?: bigint;
}

export const pendingStakeSeed: StakingSurfaceSeed = { pendingTx: mockPendingStakeTx };

function seedPoolFees(queryClient: QueryClient) {
  bitcoinStakingPoolList.forEach(pool => {
    const contractId = getPrimarySignerManagerContract(
      pool.providerId,
      pox5NetworkConfig.contractNetworkMode
    );
    const fee = mockFeeByProvider[pool.providerId];
    if (!contractId || fee === undefined) return;
    queryClient.setQueryData(
      createGetPox5PoolFeeQueryOptions({
        signerManagerContractId: contractId,
        apiUrl: pox5NetworkConfig.apiUrl,
      }).queryKey,
      fee
    );
  });

  Object.values(byosmContractIds).forEach(contractId => {
    queryClient.setQueryData(
      createGetPox5PoolFeeQueryOptions({
        signerManagerContractId: contractId,
        apiUrl: pox5NetworkConfig.apiUrl,
      }).queryKey,
      { activeFeeBips: 450, pendingFeeBips: null, pendingActivationCycle: null }
    );
  });
}

function seedPoolTvl(queryClient: QueryClient, cyclePosition: CyclePosition) {
  const cycle = createPoxInfo(cyclePosition).next_cycle.id;

  bitcoinStakingPoolList.forEach(pool => {
    const contractIds = getSignerManagerContracts(
      pool.providerId,
      pox5NetworkConfig.contractNetworkMode
    );
    const perContract = mockTotalStakedByProvider[pool.providerId];
    if (contractIds.length === 0 || perContract === undefined) return;

    contractIds.forEach((signerManagerContractId, index) => {
      queryClient.setQueryData(
        createGetPox5DelegatedAmountQueryOptions({
          signerManagerContractId,
          cycle,
          pox5ContractId,
          client: mockStacksClient,
        }).queryKey,
        perContract / BigInt(contractIds.length) + BigInt(index) * 1_000_000n
      );
    });
  });
}

export function createSeededQueryClient(seed: StakingSurfaceSeed = {}) {
  const {
    cyclePosition = 'open',
    stakerInfo = null,
    pendingTx = null,
    payoutPreference = null,
    earnedRewards = [],
    txOutcome = null,
    availableMicroStx = 12_500_000_000n,
    lockedMicroStx = 0n,
  } = seed;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  queryClient.setQueryData(
    createGetPoxInfoQueryOptions({ client: mockChainStackingClient }).queryKey,
    createPoxInfo(cyclePosition)
  );
  queryClient.setQueryData(
    createGetCoreInfoQueryOptions({ client: mockChainStackingClient }).queryKey,
    createCoreInfo(cyclePosition)
  );
  queryClient.setQueryData(
    createGetSecondsUntilNextCycleQueryOptions({ client: mockChainStackingClient }).queryKey,
    secondsUntilNextCycleFor(cyclePosition)
  );
  queryClient.setQueryData(
    createGetStxAddressBalanceQueryOptions({
      address: mockStacksAddress,
      client: mockStacksClient,
      network: pox5NetworkConfig.apiUrl,
    }).queryKey,
    createStxBalance(availableMicroStx, lockedMicroStx)
  );

  queryClient.setQueryData(
    createGetPox5StakerInfoQueryOptions({
      address: mockStacksAddress,
      pox5ContractId,
      client: mockStacksClient,
    }).queryKey,
    stakerInfo
  );

  queryClient.setQueryData(
    ['pox5-pending-tx', mockStacksAddress, pox5ContractId, mockStackingClient, mockStacksClient],
    pendingTx
  );

  queryClient.setQueryData(
    createGetPox5PayoutPreferenceQueryOptions({
      address: mockStacksAddress,
      signerManagerContractId: listedSignerManagerContractId,
      networkName: pox5NetworkConfig.stacksNetworkName,
      client: mockStacksClient,
    }).queryKey,
    { preference: null, supportsMinClaim: true }
  );

  if (stakerInfo) {
    queryClient.setQueryData(
      createGetPox5PayoutPreferenceQueryOptions({
        address: mockStacksAddress,
        signerManagerContractId: stakerInfo.signerManagerContractId,
        networkName: pox5NetworkConfig.stacksNetworkName,
        client: mockStacksClient,
      }).queryKey,
      { preference: payoutPreference, supportsMinClaim: true }
    );

    earnedRewards.forEach(rewards => {
      queryClient.setQueryData(
        createGetPox5EarnedRewardsQueryOptions({
          address: mockStacksAddress,
          signerManagerContractId: stakerInfo.signerManagerContractId,
          cycle: rewards.cycle,
          client: mockStacksClient,
        }).queryKey,
        rewards
      );
    });
  }

  queryClient.setQueryData(
    createGetPox5TransactionQueryOptions({ txId: mockTxId, client: mockStacksClient }).queryKey,
    txOutcome
  );

  seedPoolFees(queryClient);
  seedPoolTvl(queryClient, cyclePosition);

  return queryClient;
}
