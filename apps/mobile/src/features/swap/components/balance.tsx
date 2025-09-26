import { formatCurrency } from '@/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

interface BalancePreviewProps {
  balance: Money;
}

export function Balance({ balance }: BalancePreviewProps) {
  // TODO: Use the Balance component
  return (
    <Text variant="label03" color="ink.text-subdued">
      {formatCurrency(balance, { preset: 'shorthand-balance' })}
    </Text>
  );
}
