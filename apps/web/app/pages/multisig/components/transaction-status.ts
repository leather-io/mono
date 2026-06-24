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
