import React from 'react';

import { Balance } from '@/components/balance/balance';
import { FetchErrorCallout } from '@/components/error/fetch-error';
import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useAssetDescriptionQuery } from '@/queries/assets/fungible-asset-info.query';
import { useAssetPriceChangeQuery } from '@/queries/assets/fungible-asset-info.query';
import { useAssetPriceHistoryQuery } from '@/queries/assets/fungible-asset-info.query';
import { useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { useAccounts } from '@/store/accounts/accounts.read';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { Money, OnChainActivity } from '@leather.io/models';
import { FungibleCryptoAsset } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

import { ActivityEmpty } from '../activity/activity-empty';
import { ActivityListItem } from '../activity/activity-list-item';
import { TokenIcon } from '../balances/token-icon';
import { AccountListItem } from './account-list-item';
import { TokenDetails } from './token-details';
import { TokenOverview } from './token-overview';

const scrollViewAdjustmentOffset = 56;

interface TokenProps {
  tokenId: string;
  asset: FungibleCryptoAsset;
}

function getPriceChangeOperator(assetPriceChange: number) {
  if (assetPriceChange > 0) {
    return '+';
  } else if (assetPriceChange < 0) {
    return '-';
  } else {
    return '';
  }
}

function getPriceChangeColor(assetPriceChange: number) {
  if (assetPriceChange > 0) {
    return 'green.action-primary-default';
  } else if (assetPriceChange < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-primary';
  }
}
// PETE - smart to have a switch here and then seperate files for BTC / STX / Sip10  - same as balances

function TokenPriceChange({
  assetPrice,
  assetPriceChange,
}: {
  assetPrice: Money;
  assetPriceChange: number;
}) {
  const { i18n } = useLingui();
  // Ensure assetPrice.amount is a number before arithmetic
  const assetPriceAmount =
    typeof assetPrice.amount === 'number' ? assetPrice.amount : Number(assetPrice.amount);

  const priceChange = (assetPriceAmount * assetPriceChange) / 100;
  const priceChangeFiat = createMoney(priceChange, assetPrice.symbol);

  return (
    <>
      <Text variant="label02" color={getPriceChangeColor(assetPriceChange)}>
        {i18n._({
          id: 'token.details.price_change_percentage',
          message: '{operator}{priceChange}%',
          values: {
            operator: getPriceChangeOperator(assetPriceChange),
            priceChange: assetPriceChange,
          },
        })}{' '}
        (
        <Balance
          balance={priceChangeFiat}
          variant="label02"
          lineHeight={16}
          isQuoteCurrency
          color={getPriceChangeColor(assetPriceChange)}
        />
        )
      </Text>
    </>
  );
}

export function Token({ tokenId, asset }: TokenProps) {
  // const { totalBalance } = useTotalBalance();
  const { value } = useBtcTotalBalance();

  const { data: btcMarketData } = useBtcMarketDataQuery();

  // const quoteBalance = baseCurrencyAmountInQuoteWithFallback(availableBalance, btcMarketData);
  const accounts = useAccounts();
  const { i18n } = useLingui();
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);
  // const { data: assetPriceHistory } = useAssetPriceHistoryQuery(asset);
  console.log('assetDescription', assetDescription);
  console.log('assetPriceChange', assetPriceChange);
  // console.log('assetPriceHistory', assetPriceHistory?.prices[0].price);
  console.log('asset', asset);
  console.log('btcMarketData', btcMarketData);

  // > PEte continue finishing up the price data
  // > get colour coding for change
  // > clean up the code and get it working for STX / Sip10 / Runes also

  // > FEED this hardcoded BTC asset into assset descriptions
  // > get it working then clean up
  // > then get it working for STX / Sip10 / Runes
  // > also for individual account balances
  // > then clean the UI
  // {"category": "fungible", "chain": "bitcoin", "decimals": 8, "hasMemo": false, "protocol": "nativeBtc", "symbol": "BTC"}

  // tmp hardcoded network
  const network = 'Bitcoin';

  const activity = useTotalActivity();

  {
    /* < PETE need to determine how to smartly get token balance here.
Should I just make different files for BTC / STX / Sip10 / Runes? 
- could be cleaner and inline with what we do elsewhere

next need to focus on getting accounts containing those tokens

lastly drilling down to account specific tokens
 */
    // check for
    /** @knipignore */
    //  from Edgar wallet balance
    // pass an array of accounts to the query
    // or load all accounts
    // NEXT:
    // Pete restore this code for per waller balances https://github.com/leather-io/mono/pull/1103/files#diff-f5a583c70efd09f559a1089812a0ab37002ba91204f5311c2b1394b3f210fd50
    // check alexs new code for asset data https://github.com/leather-io/mono/pull/1416/files#diff-6c7c265cfd0c8bbe5b4a6a764414e760f836b918b424f87f60272f495f82c6e2
    // TRY make my token component be more re-usable if I can, only grabbing the token ID
    // may need to add detch state to useTotalData object instead, all data cached so not a bit deal
  }

  const { refreshing, onRefresh } = useRefreshHandler();

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  // PETE - need to work on total balance query and add FetchWrapper
  // also consider how to break up token.tsx to have a switch that loads token specific data
  // OR not and just grab the data from the query and pass it in

  // const isLoadingTotalBalance = value?.btc.state === 'loading';
  // const isErrorTotalBalance = value?.btc.state === 'error';

  const renderListHeader = () => (
    <Box>
      {/* TOKEN OVERVIEW */}
      <TokenOverview
        isLoading={false}
        heading={<TokenIcon ticker={tokenId} />}
        availableBalance={<Balance balance={availableBalance} variant="label02" lineHeight={16} />}
        quoteBalance={
          <Balance balance={quoteBalance} variant="label02" lineHeight={16} isQuoteCurrency />
        }
      />

      {/* TOKEN DETAILS */}
      <TokenDetails
        name="Bitcoin"
        ticker="BTC"
        network="Bitcoin"
        price={
          <Balance
            balance={btcMarketData?.price}
            variant="label02"
            lineHeight={16}
            isQuoteCurrency
          />
        }
        priceChange={
          <TokenPriceChange
            // PETE this needs the same empty handling state as balances. Maybe pass <Balance in to assetPrice and have it wrapped with isLoading
            assetPrice={btcMarketData?.price ?? createMoney(0, 'USD')}
            assetPriceChange={assetPriceChange?.changePercent ?? 0}
          />
        }
      />

      <Box>
        <Text variant="label03">
          {i18n._({
            id: 'token.details.header_title',
            message: '{network} Details',
            values: { network: network },
          })}
        </Text>
        {/* ACCOUNTS */}
        {accounts.list
          .filter(account => account.status !== 'hidden')
          .map(account => (
            <WalletLoader fingerprint={account.fingerprint} key={account.id}>
              {wallet => <AccountListItem key={account.id} account={account} wallet={wallet} />}
            </WalletLoader>
          ))}
      </Box>

      <Text>{t({ id: 'token.activity.header_title', message: 'Recent activity' })}</Text>
    </Box>
  );

  return (
    <Screen>
      <Screen.Header
        blurOverlay={false}
        // topElement={isErrorTotalBalance && <FetchErrorCallout />}
        rightElement={
          <Box alignItems="center" flexDirection="row" justifyContent="center" mr="2">
            <NetworkBadge />
          </Box>
        }
      />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl progressViewOffset={scrollViewAdjustmentOffset} />}
            style={{ marginTop: -scrollViewAdjustmentOffset }}
            data={
              activity.value.filter(
                activity =>
                  'asset' in activity &&
                  'symbol' in activity.asset &&
                  activity.asset.symbol === tokenId
              ) as OnChainActivity[]
            } // TODO: Unclear why was this cast. Needs clearing up.
            renderItem={({ item }) => <ActivityListItem activity={item} />}
            keyExtractor={(_, index) => `activity.${index}`}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={<ActivityEmpty />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </FetchWrapper>
    </Screen>
  );
}
