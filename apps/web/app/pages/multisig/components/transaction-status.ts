import type { MultisigTransactionStatus } from '@leather.io/models';

import type { BadgeVariant } from './badge';

interface TransactionStatusDisplay {
  label: string;
  variant: BadgeVariant;
}

const transactionStatusDisplay: Record<MultisigTransactionStatus, TransactionStatusDisplay> = {
  queued: { label: 'Queued', variant: 'pending' },
  pending: { label: 'Collecting signatures', variant: 'pending' },
  signed: { label: 'Ready to broadcast', variant: 'info' },
  broadcast: { label: 'Broadcasting', variant: 'info' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  failed: { label: 'Failed', variant: 'error' },
  dropped: { label: 'Dropped', variant: 'error' },
  cancelled: { label: 'Cancelled', variant: 'default' },
};

export function transactionStatusBadge(
  status: MultisigTransactionStatus
): TransactionStatusDisplay {
  return transactionStatusDisplay[status];
}

// Plain-text label for the row's second line (status no longer sits inline with
// the title as a chip). Reuses the badge copy.
export function transactionStatusLabel(status: MultisigTransactionStatus): string {
  return transactionStatusDisplay[status].label;
}

// Avatar sub-icon kind: in-flight states read as a clock, terminal-negative as a
// cross, confirmed as the sent arrow.
type TransactionIndicatorKind = 'sent' | 'failed' | 'pending';

export function transactionStatusIndicator(
  status: MultisigTransactionStatus
): TransactionIndicatorKind {
  switch (status) {
    case 'failed':
    case 'dropped':
    case 'cancelled':
      return 'failed';
    case 'confirmed':
      return 'sent';
    default:
      return 'pending';
  }
}

// Terminal states belong to history; everything else is still in progress.
export function isTransactionProcessed(status: MultisigTransactionStatus): boolean {
  return (
    status === 'confirmed' || status === 'failed' || status === 'dropped' || status === 'cancelled'
  );
}

// Still gathering signatures, so it wants attention: pending or queued and not
// yet at its signing threshold. Threshold unknown counts as still collecting.
export function transactionNeedsSignatures(
  status: MultisigTransactionStatus,
  approvalCount: number,
  threshold: number | undefined
): boolean {
  if (status !== 'pending' && status !== 'queued') return false;
  return threshold === undefined || approvalCount < threshold;
}
