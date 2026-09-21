import type { ReactNode } from 'react';

import { btcAsset } from '@leather.io/constants';
import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

import {
  type TokenAddressEntry,
  type TokenBalanceEntry,
  TokenBalancesTab,
} from './components/token-balances-tab';
import { TokenDetailsLayout } from './token-details.layout';

interface BitcoinTokenDetailsLayoutProps {
  icon: ReactNode;
  balance: Money;
  fiatBalance: Money;
  price: Money;
  descriptionText: string;
  balances: TokenBalanceEntry[];
  addresses: TokenAddressEntry[];
  activity: BlockchainActivityItem[];
  isSwapEnabled: boolean;
}

export function BitcoinTokenDetailsLayout({
  icon,
  balance,
  fiatBalance,
  price,
  descriptionText,
  balances,
  addresses,
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
      balance={balance}
      fiatBalance={fiatBalance}
      name="Bitcoin (BTC)"
      asset={btcAsset}
      price={price}
      layer="Layer 1 (Bitcoin)"
      descriptionText={descriptionText}
      balancesContent={
        <TokenBalancesTab
          balances={balances}
          addresses={addresses}
          formatAmount={amount => formatCurrency(amount, { preset: 'pad-decimals' })}
        />
      }
      activity={activity}
    />
  );
}
