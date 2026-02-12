import type { ReactNode } from 'react';

import type { ActivityView } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';

import { TokenDetailsBalanceItem } from './components/token-details-balance-item';
import { TokenDetailsLayout } from './token-details.layout';

interface StacksTokenDetailsLayoutProps {
  icon: ReactNode;
  availableBalance: Money;
  fiatBalance: Money;
  price: Money;
  changePercent: number;
  priceChangeDelta?: string;
  descriptionText: string;
  address?: string;
  activity: ActivityView[];
}

export function StacksTokenDetailsLayout({
  icon,
  availableBalance,
  fiatBalance,
  price,
  changePercent,
  priceChangeDelta,
  descriptionText,
  address,
  activity,
}: StacksTokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title="Stacks"
      symbol="STX"
      receivePath={`/${RouteUrls.ReceiveStx}`}
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
        <TokenDetailsBalanceItem
          title="Stacks"
          address={address}
          rightTop={formatCurrency(availableBalance, { preset: 'pad-decimals' })}
          rightBottom={formatCurrency(fiatBalance)}
        />
      }
      activity={activity}
    />
  );
}
