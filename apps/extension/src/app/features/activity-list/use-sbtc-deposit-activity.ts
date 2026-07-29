import { useMemo } from 'react';

import { type UseQueryResult, useQueries } from '@tanstack/react-query';

import { SBTC_RECLAIM_URL, btcAsset } from '@leather.io/constants';
import { type BlockchainActivityItem, createBlockchainActivityItem } from '@leather.io/features';
import type { BitcoinTransaction } from '@leather.io/models';
import { createBitcoinTransactionByTxIdQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { activityViewDeps } from '@app/query/activity/blockchain-activity.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import {
  type SbtcStatus,
  useSbtcFailedDeposits,
  useSbtcPendingDeposits,
} from '@app/query/sbtc/sbtc-deposits.query';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { createSbtcDepositActivity } from './sbtc-deposit-activity';

const sbtcDepositTitle = 'BTC → sBTC';

export interface SbtcDepositOverlay {
  title: string;
  statusLabel: string;
  statusColor: string;
  reclaimUrl?: string;
}

interface SbtcDepositActivity {
  overlays: ReadonlyMap<string, SbtcDepositOverlay>;
  standaloneItems: BlockchainActivityItem[];
}

function getDepositStatusLabel(status: SbtcStatus) {
  switch (status) {
    case 'pending':
      return 'Pending deposit';
    case 'accepted':
      return 'Pending mint';
    case 'failed':
      return 'Failed';
    case 'rbf':
      return 'Replaced';
    default:
      return '';
  }
}

function getDepositStatusColor(status: SbtcStatus) {
  switch (status) {
    case 'pending':
    case 'accepted':
      return 'yellow.action-primary-default';
    case 'failed':
    case 'rbf':
      return 'red.action-primary-default';
    default:
      return 'ink.text-subdued';
  }
}

function createOverlay(status: SbtcStatus, bitcoinTxid: string): SbtcDepositOverlay | undefined {
  const statusLabel = getDepositStatusLabel(status);
  if (!statusLabel) return undefined;
  return {
    title: sbtcDepositTitle,
    statusLabel,
    statusColor: getDepositStatusColor(status),
    ...(status === 'failed' ? { reclaimUrl: `${SBTC_RECLAIM_URL}${bitcoinTxid}` } : {}),
  };
}

function combineFundingTxs(results: UseQueryResult<BitcoinTransaction | null, Error>[]) {
  return results.map(result => result.data ?? null);
}

export function useSbtcDepositActivity(feedTxids: ReadonlySet<string>): SbtcDepositActivity {
  const stxAddress = useCurrentStacksAccountAddress();
  const settings = useUserSettings();
  const { pendingSbtcDeposits } = useSbtcPendingDeposits(stxAddress);
  const { failedSbtcDeposits } = useSbtcFailedDeposits(stxAddress);
  const btcMarketData = useMarketData(btcAsset);

  const deposits = useMemo(
    () => [...pendingSbtcDeposits, ...failedSbtcDeposits],
    [pendingSbtcDeposits, failedSbtcDeposits]
  );

  const unmatchedDeposits = useMemo(
    () => deposits.filter(deposit => !feedTxids.has(deposit.bitcoinTxid)),
    [deposits, feedTxids]
  );

  const fundingTxs = useQueries({
    queries: unmatchedDeposits.map(deposit =>
      createBitcoinTransactionByTxIdQueryConfig(deposit.bitcoinTxid, settings)
    ),
    combine: combineFundingTxs,
  });

  const marketData = btcMarketData.state === 'success' ? btcMarketData.value : undefined;

  const overlays = useMemo(() => {
    const map = new Map<string, SbtcDepositOverlay>();
    for (const deposit of deposits) {
      const overlay = createOverlay(deposit.status, deposit.bitcoinTxid);
      if (overlay) map.set(deposit.bitcoinTxid, overlay);
    }
    return map;
  }, [deposits]);

  const standaloneItems = useMemo(
    () =>
      unmatchedDeposits.map((deposit, index) =>
        createBlockchainActivityItem(
          createSbtcDepositActivity(deposit, fundingTxs[index] ?? null, marketData),
          activityViewDeps
        )
      ),
    [unmatchedDeposits, fundingTxs, marketData]
  );

  return { overlays, standaloneItems };
}
