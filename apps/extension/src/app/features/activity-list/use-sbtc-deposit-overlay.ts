import { useMemo } from 'react';

import { SBTC_RECLAIM_URL } from '@leather.io/constants';

import {
  type SbtcStatus,
  useSbtcFailedDeposits,
  useSbtcPendingDeposits,
} from '@app/query/sbtc/sbtc-deposits.query';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

const sbtcDepositTitle = 'BTC → sBTC';

export interface SbtcDepositOverlay {
  title: string;
  statusLabel: string;
  statusColor: string;
  reclaimUrl?: string;
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

export function useSbtcDepositOverlays(): ReadonlyMap<string, SbtcDepositOverlay> {
  const stxAddress = useCurrentStacksAccountAddress();
  const { pendingSbtcDeposits } = useSbtcPendingDeposits(stxAddress);
  const { failedSbtcDeposits } = useSbtcFailedDeposits(stxAddress);

  return useMemo(() => {
    const overlays = new Map<string, SbtcDepositOverlay>();
    for (const deposit of [...pendingSbtcDeposits, ...failedSbtcDeposits]) {
      const overlay = createOverlay(deposit.status, deposit.bitcoinTxid);
      if (overlay) overlays.set(deposit.bitcoinTxid, overlay);
    }
    return overlays;
  }, [pendingSbtcDeposits, failedSbtcDeposits]);
}
