import { ActionButtons } from '@/components/action-buttons';
import { Balance } from '@/components/balance/balance';
import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { useGlobalSheets } from '@/core/global-sheet-provider';
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

import { FungibleCryptoAsset, Money, OnChainActivity } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

import { ReceiveType } from '../receive/receive-flow-provider';

const protocolMatch = match<FungibleCryptoAsset['protocol']>();

interface TokenProps {
  activity: OnChainActivity[];
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  canSend?: boolean;
  children?: React.ReactNode;
  tokenId: string;
  quoteBalance: Money;
}

export function Token({
  activity,
  asset,
  availableBalance,
  canSend = true,
  children,
  quoteBalance,
  tokenId,
}: TokenProps) {
  const { sendSheetRef, receiveSheetRef } = useGlobalSheets();
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);
  const changePercent = assetPriceChange?.changePercent ?? 0;
  const receiveType = protocolMatch<ReceiveType>(asset.protocol, {
    sip10: 'stacks',
    rune: 'taproot',
    brc20: 'taproot',
    src20: 'taproot',
    nativeBtc: 'bitcoin',
    stx20: 'stacks',
    nativeStx: 'stacks',
  });

  return (
    <Screen>
      <Screen.Header
        centerElement={<HeaderTitle title={getTokenName(asset)} />}
        rightElement={<NetworkBadge />}
      />
      <TokenActivity
        activity={activity}
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
              actionButtons={
                <ActionButtons
                  onSend={() => sendSheetRef.current?.present()}
                  onReceive={() => receiveSheetRef.current?.present(receiveType)}
                  canSend={canSend}
                />
              }
            />
            {/* TODO LEA-3015: add better loading state for description*/}
            {assetDescription?.description && (
              <TokenDescription>{assetDescription.description}</TokenDescription>
            )}
            <TokenDetailsTable
              name={getTokenName(asset, true)}
              layer={getChainLayerFromAssetProtocol(asset.protocol)}
              price={<Balance balance={price} variant="label02" lineHeight={16} />}
              priceChange={
                price && (
                  <TokenPriceChange
                    // TODO LEA-3015: add better loading state for price change - same as balances
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
