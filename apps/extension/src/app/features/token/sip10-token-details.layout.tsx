import type { ReactNode } from 'react';

import type { ActivityView } from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';

import { TokenDetailsBalanceItem } from './components/token-details-balance-item';
import { TokenDetailsLayout } from './token-details.layout';

interface Sip10TokenDetailsLayoutProps {
  icon: ReactNode;
  name: string;
  symbol: string;
  availableBalance: Money;
  fiatBalance: Money;
  price?: Money;
  changePercent: number;
  priceChangeDelta?: string;
  descriptionText: string;
  contractDetails: string;
  address?: string;
  activity: ActivityView[];
}

export function Sip10TokenDetailsLayout({
  icon,
  name,
  symbol,
  availableBalance,
  fiatBalance,
  price,
  changePercent,
  priceChangeDelta,
  descriptionText,
  contractDetails,
  address,
  activity,
}: Sip10TokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title={name}
      symbol={symbol}
      receivePath={`/${RouteUrls.ReceiveStx}`}
      swapChain="stacks"
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      name={`${name} (${symbol})`}
      price={price}
      changePercent={changePercent}
      priceChangeDelta={priceChangeDelta}
      layer="Layer 2 (Stacks)"
      contractDetails={contractDetails}
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
