import type { Money } from '@leather.io/models';
import { Badge, LockIcon } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';

interface LockedBalanceBadgeProps {
  balance: Money;
}
export function LockedBalanceBadge({ balance }: LockedBalanceBadgeProps) {
  return (
    <Badge
      icon={<LockIcon variant="small" />}
      label={formatCurrency(balance, { showCurrency: false })}
    />
  );
}
