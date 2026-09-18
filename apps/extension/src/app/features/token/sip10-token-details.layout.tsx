import type { ReactNode } from 'react';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { FungibleCryptoAsset, Money } from '@leather.io/models';

import { TokenDetailsLayout } from './token-details.layout';

interface Sip10TokenDetailsLayoutProps {
  icon: ReactNode;
  name: string;
  symbol: string;
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  fiatBalance: Money;
  price?: Money;
  descriptionText: string;
  contractDetails: string;
  activity: BlockchainActivityItem[];
}

export function Sip10TokenDetailsLayout({
  icon,
  name,
  symbol,
  asset,
  availableBalance,
  fiatBalance,
  price,
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
      asset={asset}
      price={price}
      layer="Layer 2 (Stacks)"
      contractDetails={contractDetails}
      descriptionText={descriptionText}
      activity={activity}
    />
  );
}
