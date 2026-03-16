import { ActionButtons } from '@/components/action-buttons';
import { Balance } from '@/components/balance/balance';
import { PriceChange } from '@/components/balance/price-change';
import { FetchState } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TokenActivity } from '@/features/token/components/token-activity';
import { TokenDetailsTable } from '@/features/token/components/token-details-table';
import { TokenOverview } from '@/features/token/components/token-overview';

import { type ActivityView, type TokenBalance } from '@leather.io/features';
import { FungibleCryptoAsset, isSwappableAsset } from '@leather.io/models';
import { Box, SkeletonLoader, Text } from '@leather.io/ui/native';

import { getReceiveType } from '../receive/utils/get-receive-type';
import { TokenDescription } from './components/token-description';
import { useGetTokenDetails } from './use-get-token-details';
import { getAvailableBalance, getQuoteBalance } from './utils/get-balance';

interface TokenProps {
  activity: FetchState<ActivityView[]>;
  asset: FungibleCryptoAsset;
  balance: FetchState<TokenBalance>;
  canSend?: boolean;
  canSwap?: boolean;
  children?: React.ReactNode;
  icon: React.ReactNode;
  layer: string;
  name: string;
  title: string;
}

export function Token({
  activity,
  asset,
  balance,
  canSend = true,
  canSwap = true,
  children,
  icon,
  layer,
  name,
  title,
}: TokenProps) {
  const { sendSheetRef, receiveSheetRef, swapSheetRef, rampSheetRef } = useGlobalSheets();
  const {
    tokenDetails: { value: tokenDetails, state: tokenDetailsState },
  } = useGetTokenDetails({ asset });
  const { description, changePercent, price } = tokenDetails ?? {};
  const receiveType = getReceiveType(asset);

  const availableBalance = getAvailableBalance(balance);
  const quoteBalance = getQuoteBalance(balance);
  const isLoading = balance.state === 'loading' || tokenDetailsState === 'loading';

  return (
    <Screen>
      <Screen.Header
        centerElement={<HeaderTitle title={title} />}
        rightElement={<NetworkBadge />}
      />
      <TokenActivity
        activity={activity}
        // All other content is in the Activity ListHeader to avoid nested scrolling errors
        ListHeader={
          <>
            <TokenOverview
              heading={<Screen.Title>{icon}</Screen.Title>}
              availableBalance={
                <Box flexDirection="row" alignItems="center" gap="1">
                  <SkeletonLoader height={23} maxWidth={120} isLoading={isLoading}>
                    <Balance
                      balance={availableBalance}
                      formattingOptions={{ showCurrency: false }}
                      variant="heading03"
                    />
                  </SkeletonLoader>
                  <SkeletonLoader height={23} maxWidth={60} isLoading={isLoading}>
                    <Text variant="heading03" color="ink.text-subdued-primary">
                      {asset.symbol}
                    </Text>
                  </SkeletonLoader>
                </Box>
              }
              quoteBalance={
                <Box flexDirection="row" alignItems="center" gap="1" pt={isLoading ? '1' : '0'}>
                  <SkeletonLoader height={14} maxWidth={62} isLoading={isLoading}>
                    <Balance
                      balance={quoteBalance}
                      formattingOptions={{ showCurrency: false }}
                      variant="label01"
                    />
                  </SkeletonLoader>
                </Box>
              }
              actionButtons={
                <ActionButtons
                  onSend={canSend ? () => sendSheetRef.current?.present(asset) : undefined}
                  onReceive={() => receiveSheetRef.current?.present(receiveType)}
                  onSwap={
                    isSwappableAsset(asset) && canSwap
                      ? () => swapSheetRef.current?.present({ baseAsset: asset })
                      : undefined
                  }
                  onBuy={() => {
                    rampSheetRef.current?.present('buy', asset);
                  }}
                  onSell={() => {
                    rampSheetRef.current?.present('sell', asset);
                  }}
                />
              }
            />

            <TokenDescription description={description} isLoading={isLoading} />
            <TokenDetailsTable
              name={name}
              layer={layer}
              price={
                <Box flexDirection="row" alignItems="center" gap="1">
                  <SkeletonLoader height={23} maxWidth={120} isLoading={isLoading}>
                    <Balance
                      balance={price}
                      formattingOptions={{ showCurrency: false }}
                      variant="label02"
                      lineHeight={16}
                    />
                  </SkeletonLoader>
                </Box>
              }
              priceChange={
                <Box flexDirection="row" alignItems="baseline" gap="1">
                  <SkeletonLoader height={23} maxWidth={120} isLoading={isLoading}>
                    <PriceChange price={price} changePercent={changePercent} />
                  </SkeletonLoader>
                </Box>
              }
            />
            {children}
          </>
        }
      />
    </Screen>
  );
}
