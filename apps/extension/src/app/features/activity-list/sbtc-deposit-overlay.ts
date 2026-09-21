import { SBTC_RECLAIM_URL } from '@leather.io/constants';

import type { SbtcStatus } from '@app/query/sbtc/sbtc-deposits.query';

const sbtcDepositTitle = 'BTC → sBTC';

type SbtcDepositStatusTone = 'default' | 'warning' | 'error';

export interface SbtcDepositOverlay {
  title: string;
  statusLabel: string;
  statusColor: string;
  statusTone: SbtcDepositStatusTone;
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

function getDepositStatusTone(status: SbtcStatus): SbtcDepositStatusTone {
  switch (status) {
    case 'pending':
    case 'accepted':
      return 'warning';
    case 'failed':
    case 'rbf':
      return 'error';
    default:
      return 'default';
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

export function createSbtcDepositOverlay(status: SbtcStatus): SbtcDepositOverlay | undefined {
  const statusLabel = getDepositStatusLabel(status);
  if (!statusLabel) return undefined;
  return {
    title: sbtcDepositTitle,
    statusLabel,
    statusColor: getDepositStatusColor(status),
    statusTone: getDepositStatusTone(status),
    ...(status === 'failed' ? { reclaimUrl: SBTC_RECLAIM_URL } : {}),
  };
}
