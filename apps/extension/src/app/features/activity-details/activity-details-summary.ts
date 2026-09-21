import {
  type BlockchainActivityItem,
  buildBlockchainActivityStatusHeadline,
  interpolateActivityTemplate,
} from '@leather.io/features';
import type {
  BlockchainActivityBalanceChange,
  CryptoAsset,
  OnChainActivityStatus,
} from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import type { SbtcDepositOverlay } from '../activity-list/sbtc-deposit-overlay';

export type ActivityStatusTone = 'default' | 'success' | 'warning' | 'error';

export interface ActivityStatus {
  label: string;
  preposition: string;
  tone: ActivityStatusTone;
}

export interface ActivityOutcomeGroup {
  direction: 'sent' | 'received';
  changes: BlockchainActivityBalanceChange[];
}

export interface ActivityDetailsSummary {
  headline: string;
  status: ActivityStatus;
  outcomes: ActivityOutcomeGroup[];
  counterparty?: string;
  dateLabel?: string;
}

const activityStatuses: Record<OnChainActivityStatus, ActivityStatus> = {
  pending: { label: 'Pending', preposition: 'since', tone: 'warning' },
  success: { label: 'Confirmed', preposition: 'on', tone: 'success' },
  failed: { label: 'Failed', preposition: 'on', tone: 'error' },
};

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatActivityDateTime(timestamp: number) {
  return dateTimeFormat.format(new Date(timestamp * 1000));
}

export function resolveAssetTitle(asset: CryptoAsset) {
  return asset.name;
}

function resolveOutcomes(changes: BlockchainActivityBalanceChange[]): ActivityOutcomeGroup[] {
  const sent = changes.filter(change => change.direction === 'sent');
  const received = changes.filter(change => change.direction === 'received');
  return [
    ...(sent.length > 0 ? [{ direction: 'sent' as const, changes: sent }] : []),
    ...(received.length > 0 ? [{ direction: 'received' as const, changes: received }] : []),
  ];
}

export function buildActivityDetailsSummary(
  item: BlockchainActivityItem,
  overlay?: SbtcDepositOverlay
): ActivityDetailsSummary {
  const { activity, view } = item;
  const status = activityStatuses[view.status];
  const outcomes = resolveOutcomes(activity.balanceChanges);

  return {
    headline: buildBlockchainActivityStatusHeadline(
      { action: view.action, status: view.status, fallbackTitle: view.title },
      interpolateActivityTemplate
    ),
    status: overlay ? { ...status, label: overlay.statusLabel, tone: overlay.statusTone } : status,
    outcomes,
    ...(activity.counterparty ? { counterparty: truncateMiddle(activity.counterparty) } : {}),
    ...(view.timestamp > 0 ? { dateLabel: formatActivityDateTime(view.timestamp) } : {}),
  };
}
