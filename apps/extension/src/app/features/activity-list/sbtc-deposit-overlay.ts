import { SBTC_RECLAIM_URL } from '@leather.io/constants';

import type { SbtcStatus } from '@app/query/sbtc/sbtc-deposits.query';

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

export function createSbtcDepositOverlay(
  status: SbtcStatus,
  bitcoinTxid: string
): SbtcDepositOverlay | undefined {
  const statusLabel = getDepositStatusLabel(status);
  if (!statusLabel) return undefined;
  return {
    title: sbtcDepositTitle,
    statusLabel,
    statusColor: getDepositStatusColor(status),
    ...(status === 'failed' ? { reclaimUrl: `${SBTC_RECLAIM_URL}${bitcoinTxid}` } : {}),
  };
}
