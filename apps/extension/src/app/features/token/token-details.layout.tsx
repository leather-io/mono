import type { ReactNode } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import {
  type BlockchainActivityItem,
  formatPriceChangeText,
  getPriceChangeColor,
} from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';
import type { ReceiveView } from '@app/common/receive/receive';
import { DetailsRow } from '@app/components/details/details-row';
import { DetailsScreen } from '@app/components/details/details-screen';
import { DetailsSection } from '@app/components/details/details-section';

import { ActivityRow } from '../activity-list/components/activity-row';
import { type SwapChain, TokenDetailsActionsRow } from './components/token-details-actions';
import { TokenDetailsHeader } from './components/token-details-header';
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
  price?: Money;
  changePercent: number;
  priceChangeDelta?: string;
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
  price,
  changePercent,
  priceChangeDelta,
  layer,
  contractDetails = '—',
  descriptionText,
  balancesContent,
  activity,
  isBuyEnabled = true,
  isSwapEnabled = true,
}: TokenDetailsLayoutProps) {
  return (
    <DetailsScreen
      header={<TokenDetailsHeader title={title} />}
      testId="token-details-container"
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
      {descriptionText ? (
        <DetailsSection title="Description">
          <Box px="space.05" pb="space.03">
            <styled.p textStyle="body.02" margin="0">
              {descriptionText}
            </styled.p>
          </Box>
        </DetailsSection>
      ) : null}

      <DetailsSection title="Token details">
        <DetailsRow label="Name" value={name} testId="token-details-name" />
        <DetailsRow
          label="Price"
          value={price ? formatCurrency(price) : '—'}
          testId="token-details-price"
        />
        <DetailsRow
          label="Price change (24hr)"
          value={
            <styled.span textStyle="caption.01" color={getPriceChangeColor(changePercent)}>
              {formatPriceChangeText({ changePercent, priceChangeDelta })}
            </styled.span>
          }
          testId="token-details-price-change"
        />
        <DetailsRow label="Layer" value={layer} testId="token-details-layer" />
        <DetailsRow label="Contract details" value={contractDetails} />
      </DetailsSection>

      {balancesContent ? <DetailsSection title="Balances">{balancesContent}</DetailsSection> : null}

      {activity.length > 0 ? (
        <DetailsSection title="Activity">
          {activity.map(item => (
            <ActivityRow key={item.view.key} item={item} />
          ))}
        </DetailsSection>
      ) : null}
    </DetailsScreen>
  );
}
