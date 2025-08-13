import { ActionButtons } from '@/components/action-buttons';
import { Balance } from '@/components/balance/balance';
import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TokenActivity } from '@/features/token/components/token-activity';
import { TokenDescription } from '@/features/token/components/token-description';
import { TokenDetailsTable } from '@/features/token/components/token-details-table';
import { TokenIcon } from '@/features/token/components/token-icon';
import { TokenOverview } from '@/features/token/components/token-overview';
import { TokenPriceChange } from '@/features/token/components/token-price-change';
import { getChainLayerFromAssetProtocol } from '@/features/token/utils/get-chain-layer-from-protocol';
import { getTokenName } from '@/features/token/utils/get-token-name';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

interface TokenProps {
  children?: React.ReactNode;
  accountId?: string;
  tokenId: string;
  asset: FungibleCryptoAsset;
  canSend: boolean;
  availableBalance: Money;
  quoteBalance: Money;
}

export function Token({ children, asset, availableBalance, quoteBalance, tokenId }: TokenProps) {
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);
  const changePercent = assetPriceChange?.changePercent ?? 0;

  const canSend = tokenId === 'BTC' || tokenId === 'STX';

  return (
    <Screen>
      <Screen.Header
        centerElement={<HeaderTitle title={getTokenName(asset)} />}
        rightElement={<NetworkBadge />}
      />
      <TokenActivity
        // All other content is in the Activity ListHeader to avoid nested scrolling errors
        ListHeader={
          <>
            <TokenOverview
              heading={
                <Screen.Title>
                  <TokenIcon ticker={tokenId} asset={asset} />
                </Screen.Title>
              }
              availableBalance={
                <Box flexDirection="row" alignItems="center" gap="1">
                  <Balance
                    balance={availableBalance}
                    formattingOptions={{ showCurrency: false }}
                    variant="heading03"
                  />
                  <Text variant="heading03" color="ink.text-subdued">
                    {tokenId}
                  </Text>
                </Box>
              }
              quoteBalance={<Balance balance={quoteBalance} variant="label01" />}
              actionButtons={<ActionButtons canSend={canSend} />}
            />
            {assetDescription?.description && (
              <TokenDescription>{assetDescription.description}</TokenDescription>
            )}
            <TokenDetailsTable
              // PETE simplify this now we have separate screens for BTC, STX & SIP-10 tokens
              name={getTokenName(asset, true)}
              layer={getChainLayerFromAssetProtocol(asset.protocol)}
              price={<Balance balance={price} variant="label02" lineHeight={16} />}
              priceChange={
                price && (
                  <TokenPriceChange
                    // PETE this needs the same empty handling state as balances. Maybe pass <Balance in to assetPrice and have it wrapped with isLoading
                    price={price}
                    changePercent={changePercent}
                  />
                )
              }
            />
            {children}
          </>
        }
      />
    </Screen>
  );
}
