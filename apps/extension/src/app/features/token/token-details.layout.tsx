import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { FungibleCryptoAsset, Money } from '@leather.io/models';

import type { ReceiveView } from '@app/common/receive/receive';

import { ActivityRow } from '../activity-list/components/activity-row';
import { TokenPriceHistory } from './components/price-history/token-price-history';
import { type SwapChain, TokenDetailsActionsRow } from './components/token-details-actions';
import { TokenDetailsRow } from './components/token-details-row';
import { TokenDetailsScreen } from './components/token-details-screen';
import { TokenDetailsSection } from './components/token-details-section';
import { TokenOverview } from './components/token-overview';

interface TokenDetailsLayoutProps {
  icon: ReactNode;
  title: string;
  symbol: string;
  receiveView: ReceiveView;
  swapChain: SwapChain;
  availableBalance: Money;
  fiatBalance: Money;
  name: string;
  asset: FungibleCryptoAsset;
  price?: Money;
  layer: string;
  contractDetails?: string;
  descriptionText?: string;
  balancesContent?: ReactNode;
  activity: BlockchainActivityItem[];
  isBuyEnabled?: boolean;
  isSwapEnabled?: boolean;
}

export function TokenDetailsLayout({
  icon,
  title,
  symbol,
  receiveView,
  swapChain,
  availableBalance,
  fiatBalance,
  name,
  asset,
  price,
  layer,
  contractDetails = '—',
  descriptionText,
  balancesContent,
  activity,
  isBuyEnabled = true,
  isSwapEnabled = true,
}: TokenDetailsLayoutProps) {
  return (
    <TokenDetailsScreen
      title={title}
      overview={
        <TokenOverview
          icon={icon}
          availableBalance={availableBalance}
          symbol={symbol}
          fiatBalance={fiatBalance}
          actions={
            <TokenDetailsActionsRow
              symbol={symbol}
              receiveView={receiveView}
              swapChain={swapChain}
              isBuyEnabled={isBuyEnabled}
              isSwapEnabled={isSwapEnabled}
            />
          }
        />
      }
    >
      {price && price.amount.isGreaterThan(0) && (
        <TokenDetailsSection title="Price">
          <TokenPriceHistory asset={asset} price={price} />
        </TokenDetailsSection>
      )}

      {descriptionText ? (
        <TokenDetailsSection title="Description">
          <Box px="space.05" pb="space.03">
            <styled.p textStyle="body.02" margin="0">
              {descriptionText}
            </styled.p>
          </Box>
        </TokenDetailsSection>
      ) : null}

      <TokenDetailsSection title="Token details">
        <TokenDetailsRow label="Name" value={name} testId="token-details-name" />
        <TokenDetailsRow label="Layer" value={layer} testId="token-details-layer" />
        <TokenDetailsRow label="Contract details" value={contractDetails} />
      </TokenDetailsSection>

      {balancesContent ? (
        <TokenDetailsSection title="Balances">{balancesContent}</TokenDetailsSection>
      ) : null}

      {activity.length > 0 ? (
        <TokenDetailsSection title="Activity">
          {activity.map(item => (
            <ActivityRow key={item.view.key} item={item} />
          ))}
        </TokenDetailsSection>
      ) : null}
    </TokenDetailsScreen>
  );
}
