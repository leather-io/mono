import type { ReactNode } from 'react';

import { btcAsset } from '@leather.io/constants';
import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

import { TokenDetailsBalanceItem } from './components/token-details-balance-item';
import { TokenDetailsLayout } from './token-details.layout';

interface BalanceEntry {
  title: string;
  address?: string;
  btcBalance: Money;
  fiatBalance: Money;
  onPressAddress?(): void;
  onPressRow?(): void;
}

interface BitcoinTokenDetailsLayoutProps {
  icon: ReactNode;
  totalBalance: Money;
  fiatBalance: Money;
  price: Money;
  descriptionText: string;
  balances: BalanceEntry[];
  activity: BlockchainActivityItem[];
  isSwapEnabled: boolean;
}

export function BitcoinTokenDetailsLayout({
  icon,
  totalBalance,
  fiatBalance,
  price,
  descriptionText,
  balances,
  activity,
  isSwapEnabled,
}: BitcoinTokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title="Bitcoin"
      symbol="BTC"
      receiveView="btc"
      swapChain="bitcoin"
      isSwapEnabled={isSwapEnabled}
      availableBalance={totalBalance}
      fiatBalance={fiatBalance}
      name="Bitcoin (BTC)"
      asset={btcAsset}
      price={price}
      layer="Layer 1 (Bitcoin)"
      descriptionText={descriptionText}
      balancesContent={
        <>
          {balances.map(balance => (
            <TokenDetailsBalanceItem
              key={balance.title}
              title={balance.title}
              address={balance.address}
              rightTop={formatCurrency(balance.btcBalance, { preset: 'pad-decimals' })}
              rightBottom={formatCurrency(balance.fiatBalance)}
              onPressAddress={balance.onPressAddress}
              onPressRow={balance.onPressRow}
            />
          ))}
        </>
      }
      activity={activity}
    />
  );
}
