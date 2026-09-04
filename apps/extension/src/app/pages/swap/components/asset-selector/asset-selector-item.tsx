import { ReactNode } from 'react';

import { SwapRevampSelectors } from '@tests/selectors/swap-revamp.selectors';
import { styled } from 'leather-styles/jsx';

import { Money } from '@leather.io/models';
import { ItemLayout } from '@leather.io/ui';

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
  symbol,
  icon,
  balance,
  quoteBalance,
  onPress,
}: AssetSelectorItemProps) {
  return (
    <styled.button
      onClick={onPress}
      data-testid={SwapRevampSelectors.AssetItem}
      data-symbol={symbol}
      display="flex"
      width="100%"
      justifyContent="space-between"
      py="space.03"
      px="space.05"
      _hover={{
        backgroundColor: 'ink.component-background-hover',
      }}
    >
      <ItemLayout
        img={icon}
        titleLeft={name}
        captionLeft={balance ? formatCurrency(balance) : ''}
        titleRight={quoteBalance ? formatCurrency(quoteBalance) : undefined}
      />
    </styled.button>
  );
}
