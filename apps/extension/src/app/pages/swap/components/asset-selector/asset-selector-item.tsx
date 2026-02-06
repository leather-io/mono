import { ReactNode } from 'react';

import { Money } from '@leather.io/models';
import { ItemLayout, Pressable } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';

interface AssetSelectorItemProps {
  name: string;
  symbol: string;
  icon: ReactNode;
  balance?: Money;
  quoteBalance?: Money;
  onPress?(): void;
}

export function AssetSelectorItem({
  name,
  icon,
  balance,
  quoteBalance,
  onPress,
}: AssetSelectorItemProps) {
  return (
    <Pressable onClick={onPress} my="space.02" px="space.05">
      <ItemLayout
        img={icon}
        titleLeft={name}
        captionLeft={balance ? formatCurrency(balance) : ''}
        titleRight={quoteBalance ? formatCurrency(quoteBalance) : undefined}
      />
    </Pressable>
  );
}
