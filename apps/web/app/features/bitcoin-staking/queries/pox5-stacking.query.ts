import { useQueries, useQuery } from '@tanstack/react-query';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { useLeatherConnect } from '~/store/addresses';

import { usePox5StackingClient, usePox5StacksClient } from '../hooks/use-pox5-clients';
import { getPox5TxRefetchInterval } from '../transactions/pox5-tx-status';
import { getPox5ContractId } from '../utils/pox5-contracts';
import {
  Pox5EarnedRewards,
  createGetPox5EarnedRewardsQueryOptions,
} from './create-get-pox5-earned-rewards-query-options';
import { createGetPox5PayoutPreferenceQueryOptions } from './create-get-pox5-payout-preference-query-options';
import {
  Pox5StakerInfo,
  createGetPox5StakerInfoQueryOptions,
} from './create-get-pox5-staker-info-query-options';
import { createGetPox5TransactionQueryOptions } from './create-get-pox5-transaction-query-options';
import { getPendingPox5Transaction } from './get-pending-pox5-txs';
import { usePox5PoxInfoQuery } from './pox5-node.query';

// All pox-5 interaction happens on the configured chain, so the contract id
// and every read below are pinned there rather than following the app's
// network selector.
export function usePox5ContractId(): string {
  return getPox5ContractId(pox5NetworkConfig.contractNetworkMode);
}

export function usePox5StakerInfoQuery() {
  const { stacksAccount } = useLeatherConnect();
  const client = usePox5StacksClient();
  const pox5ContractId = usePox5ContractId();

  return useQuery(
    createGetPox5StakerInfoQueryOptions({
      address: stacksAccount?.address,
      pox5ContractId,
      client,
    })
  );
}

export function usePox5PayoutPreferenceQuery(signerManagerContractId: string | undefined) {
  const { stacksAccount } = useLeatherConnect();
  const client = usePox5StacksClient();

  return useQuery(
    createGetPox5PayoutPreferenceQueryOptions({
      address: stacksAccount?.address,
      signerManagerContractId,
      networkName: pox5NetworkConfig.stacksNetworkName,
      client,
    })
  );
}

export function usePox5PendingTxQuery() {
  const client = usePox5StackingClient();
  const { stacksAccount } = useLeatherConnect();
  const stacksClient = usePox5StacksClient();
  const pox5ContractId = usePox5ContractId();
  const address = stacksAccount?.address;

  return useQuery({
    queryKey: ['pox5-pending-tx', address, pox5ContractId, client, stacksClient],
    enabled: !!client && !!address,
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn() {
      if (!client || !address) return null;
      return getPendingPox5Transaction({
        stackingClient: client,
        stacksClient,
        address,
        pox5ContractId,
      });
    },
  });
}

export function usePox5TransactionQuery(txId: string | null) {
  const client = usePox5StacksClient();

  return useQuery({
    ...createGetPox5TransactionQueryOptions({ txId, client }),
    refetchInterval(query) {
      return getPox5TxRefetchInterval(query.state.data);
    },
  });
}

// The signer-manager only exposes per-cycle earned rewards, so the claimable
// balance is a client-side fan-out. The window is capped to the most recent
// completed cycles to avoid firing up to 96 read calls for long positions.
const claimableCycleWindow = 12;

function getClaimableCycles(
  info: Pox5StakerInfo | null | undefined,
  currentCycleId: number | undefined
): number[] {
  if (!info || currentCycleId === undefined) return [];
  const lastEarnedCycle = Math.min(currentCycleId - 1, info.firstRewardCycle + info.numCycles - 1);
  if (lastEarnedCycle < info.firstRewardCycle) return [];
  const firstShownCycle = Math.max(
    info.firstRewardCycle,
    lastEarnedCycle - claimableCycleWindow + 1
  );
  return Array.from(
    { length: lastEarnedCycle - firstShownCycle + 1 },
    (_, index) => firstShownCycle + index
  );
}

export interface Pox5ClaimableRewards {
  isLoading: boolean;
  totalEarned: bigint;
  byCycle: Pox5EarnedRewards[];
}

export function usePox5ClaimableRewards(): Pox5ClaimableRewards {
  const { stacksAccount } = useLeatherConnect();
  const client = usePox5StacksClient();
  const stakerInfoQuery = usePox5StakerInfoQuery();
  const poxInfoQuery = usePox5PoxInfoQuery();

  const stakerInfo = stakerInfoQuery.data;
  const cycles = getClaimableCycles(stakerInfo, poxInfoQuery.data?.current_cycle.id);

  const rewardsQueries = useQueries({
    queries: cycles.map(cycle =>
      createGetPox5EarnedRewardsQueryOptions({
        address: stacksAccount?.address,
        signerManagerContractId: stakerInfo?.signerManagerContractId,
        cycle,
        client,
      })
    ),
  });

  const byCycle = rewardsQueries
    .map(query => query.data)
    .filter(rewards => rewards !== null && rewards !== undefined)
    .filter(rewards => rewards.earned > 0n);

  return {
    isLoading:
      stakerInfoQuery.isLoading ||
      poxInfoQuery.isLoading ||
      rewardsQueries.some(query => query.isLoading),
    totalEarned: byCycle.reduce((sum, rewards) => sum + rewards.earned, 0n),
    byCycle,
  };
}
