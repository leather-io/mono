import { ReactNode } from 'react';

import { formatCurrency } from '@/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { Cell } from '@leather.io/ui/native';

interface AssetListItemProps {
  name: string;
  symbol: string;
  icon: ReactNode;
  balance?: Money;
  quoteBalance?: Money;
  onPress?(): void;
}

export function AssetSelectorItem({
  balance,
  icon,
  name,
  quoteBalance,
  onPress,
}: AssetListItemProps) {
  return (
    <Cell.Root pressable={!!onPress} onPress={onPress}>
      <Cell.Icon>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{name}</Cell.Label>
        {balance && (
          <Cell.Label variant="primary" color="ink.text-subdued-secondary">
            {formatCurrency(balance)}
          </Cell.Label>
        )}
      </Cell.Content>
      <Cell.Aside>
        {quoteBalance && <Cell.Label variant="primary">{formatCurrency(quoteBalance)}</Cell.Label>}
      </Cell.Aside>
    </Cell.Root>
  );
}
