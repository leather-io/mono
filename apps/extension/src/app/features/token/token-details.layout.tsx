import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import type { BlockchainActivityItem } from '@leather.io/features';
import type { FungibleCryptoAsset, Money } from '@leather.io/models';

import type { ReceiveView } from '@app/common/receive/receive';
import { useSelectTokenDetailsTab } from '@app/store/settings/settings.actions';
import { useTokenDetailsTab } from '@app/store/settings/settings.selectors';

import { TokenPriceHistory } from './components/price-history/token-price-history';
import { type SwapChain, TokenDetailsActionsRow } from './components/token-details-actions';
import { TokenDetailsRow } from './components/token-details-row';
import { TokenDetailsScreen } from './components/token-details-screen';
import { TokenDetailsTabs } from './components/token-details-tabs';
import { TokenOverview } from './components/token-overview';

interface TokenDetailsLayoutProps {
  icon: ReactNode;
  title: string;
  symbol: string;
  receiveView: ReceiveView;
  swapChain: SwapChain;
  balance: Money;
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
  balance,
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
  const activeTab = useTokenDetailsTab();
  const selectTab = useSelectTokenDetailsTab();
  const hasPrice = !!price && price.amount.isGreaterThan(0);

  return (
    <TokenDetailsScreen title={title}>
      <TokenOverview
        icon={icon}
        balance={balance}
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
      <TokenDetailsTabs
        activeTab={activeTab}
        onSelectTab={selectTab}
        priceContent={
          hasPrice ? (
            <Box pt="space.04" pb="space.02">
              <TokenPriceHistory asset={asset} price={price} />
            </Box>
          ) : null
        }
        descriptionText={descriptionText}
        balancesContent={balancesContent}
        activity={activity}
        detailRows={
          <>
            <TokenDetailsRow label="Name" value={name} testId="token-details-name" />
            <TokenDetailsRow label="Layer" value={layer} testId="token-details-layer" />
            <TokenDetailsRow label="Contract details" value={contractDetails} />
          </>
        }
      />
    </TokenDetailsScreen>
  );
}
