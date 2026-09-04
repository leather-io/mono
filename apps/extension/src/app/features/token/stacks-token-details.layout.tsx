import type { ReactNode } from 'react';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

import { TokenDetailsBalanceItem } from './components/token-details-balance-item';
import { TokenDetailsLayout } from './token-details.layout';

export interface StacksBalanceEntry {
  title: string;
  caption?: string;
  stxBalance: Money;
  fiatBalance?: Money;
  onPressRow?(): void;
}

interface StacksTokenDetailsLayoutProps {
  icon: ReactNode;
  availableBalance: Money;
  fiatBalance: Money;
  price: Money;
  changePercent: number;
  priceChangeDelta?: string;
  descriptionText: string;
  balances?: StacksBalanceEntry[];
  activity: BlockchainActivityItem[];
}

export function StacksTokenDetailsLayout({
  icon,
  availableBalance,
  fiatBalance,
  price,
  changePercent,
  priceChangeDelta,
  descriptionText,
  balances,
  activity,
}: StacksTokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title="Stacks"
      symbol="STX"
      receiveView="stx"
      swapChain="stacks"
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      name="Stacks (STX)"
      price={price}
      changePercent={changePercent}
      priceChangeDelta={priceChangeDelta}
      layer="Layer 2 (Stacks)"
      descriptionText={descriptionText}
      balancesContent={
        balances?.length ? (
          <>
            {balances.map(balance => (
              <TokenDetailsBalanceItem
                key={balance.title}
                title={balance.title}
                caption={balance.caption}
                rightTop={formatCurrency(balance.stxBalance)}
                rightBottom={balance.fiatBalance ? formatCurrency(balance.fiatBalance) : undefined}
                onPressRow={balance.onPressRow}
              />
            ))}
          </>
        ) : undefined
      }
      activity={activity}
    />
  );
}
