import type { ReactNode } from 'react';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { Money } from '@leather.io/models';

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
  activity: BlockchainActivityItem[];
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
  activity,
}: Sip10TokenDetailsLayoutProps) {
  return (
    <TokenDetailsLayout
      icon={icon}
      title={name}
      symbol={symbol}
      receiveView="stx"
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
      activity={activity}
    />
  );
}
