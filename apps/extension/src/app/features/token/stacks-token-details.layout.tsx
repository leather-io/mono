import type { ReactNode } from 'react';

import { stxAsset } from '@leather.io/constants';
import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

import { type TokenBalanceEntry, TokenBalancesTab } from './components/token-balances-tab';
import { TokenDetailsLayout } from './token-details.layout';

interface StacksTokenDetailsLayoutProps {
  icon: ReactNode;
  balance: Money;
  fiatBalance: Money;
  price: Money;
  descriptionText: string;
  balances: TokenBalanceEntry[];
  activity: BlockchainActivityItem[];
  isActivityLoading: boolean;
}

export function StacksTokenDetailsLayout({
  icon,
  balance,
  fiatBalance,
  price,
  descriptionText,
  balances,
  activity,
  isActivityLoading,
}: StacksTokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title="Stacks"
      symbol="STX"
      receiveView="stx"
      swapChain="stacks"
      balance={balance}
      fiatBalance={fiatBalance}
      name="Stacks (STX)"
      asset={stxAsset}
      price={price}
      layer="Layer 2 (Stacks)"
      descriptionText={descriptionText}
      balancesContent={
        <TokenBalancesTab balances={balances} formatAmount={amount => formatCurrency(amount)} />
      }
      activity={activity}
      isActivityLoading={isActivityLoading}
    />
  );
}
