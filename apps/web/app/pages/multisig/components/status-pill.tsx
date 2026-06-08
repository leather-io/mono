import { type TxStatus, txStatusLabel } from '../data/multisig-types';
import { Badge, type BadgeVariant } from './badge';

// Maps each transaction status to a Badge tone. queued/cancelled read as
// neutral, in-flight signing as warning/info, terminal success/failure as
// success/error.
const statusVariant: Record<TxStatus, BadgeVariant> = {
  queued: 'default',
  pending: 'warning',
  signed: 'info',
  broadcast: 'info',
  confirmed: 'success',
  failed: 'error',
  dropped: 'error',
  cancelled: 'default',
};

interface StatusPillProps {
  status: TxStatus;
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  return <Badge variant={statusVariant[status]} label={label ?? txStatusLabel[status]} />;
}
