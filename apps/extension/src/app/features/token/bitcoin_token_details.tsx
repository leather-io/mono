import { Box, Stack, styled } from 'leather-styles/jsx';

import { btcAsset } from '@leather.io/constants';
import { type AccountAddresses } from '@leather.io/models';
import { BtcAvatarIcon, Callout, Spinner } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import {
  useNativeSegwitBtcAccountBalance,
  useTaprootBtcAccountBalance,
} from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';

import { ActivityItem } from '../activity-list/components/activity-item';
import {
  TokenDetailsActionsRow,
  TokenDetailsBalanceItem,
  TokenDetailsHero,
  TokenDetailsRow,
  TokenDetailsScreen,
  TokenDetailsSection,
} from './token-details-screen.layout';

interface BitcoinTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

export function BitcoinTokenDetails({ accountIndex, account }: BitcoinTokenDetailsProps) {
  const nativeSegwitBalance = useNativeSegwitBtcAccountBalance(accountIndex);
  const taprootBalance = useTaprootBtcAccountBalance(accountIndex);
  const marketData = useMarketData(btcAsset);
  const description = useAssetDescription(btcAsset);
  const priceChange = usePriceChangePercentage(btcAsset);
  const activityQuery = useActivityByAsset(account, btcAsset);

  if (
    nativeSegwitBalance.state === 'loading' ||
    taprootBalance.state === 'loading' ||
    marketData.state === 'loading'
  ) {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (
    nativeSegwitBalance.state === 'error' ||
    taprootBalance.state === 'error' ||
    marketData.state === 'error'
  ) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load Bitcoin details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const nativeBtc = nativeSegwitBalance.value.btc.availableBalance;
  const taprootBtc = taprootBalance.value.btc.availableBalance;
  const availableBalance = createMoney(nativeBtc.amount.plus(taprootBtc.amount), nativeBtc.symbol);

  const nativeQuote = nativeSegwitBalance.value.quote.availableBalance;
  const taprootQuote = taprootBalance.value.quote.availableBalance;
  const fiatBalance = createMoney(nativeQuote.amount.plus(taprootQuote.amount), nativeQuote.symbol);

  const price = marketData.value.price;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText = description.state === 'success' ? description.value.description : '';
  const activity = activityQuery.data ?? [];

  const heroAmount = availableBalance.amount
    .shiftedBy(-availableBalance.decimals)
    .toFormat(availableBalance.decimals > 8 ? 8 : availableBalance.decimals);
  const heroFiat = formatCurrency(fiatBalance);

  const hasChangePercent = typeof changePercent === 'number' && Number.isFinite(changePercent);
  const hasPrice = Boolean(price);
  const priceChangeDelta =
    hasChangePercent && hasPrice
      ? formatCurrency(
          createMoney(price.amount.multipliedBy(changePercent).dividedBy(100), price.symbol)
        )
      : '';
  const priceChangeText =
    hasChangePercent && priceChangeDelta
      ? `${changePercent.toFixed(2)}% (${priceChangeDelta})`
      : hasChangePercent
        ? `${changePercent.toFixed(2)}%`
        : '—';

  return (
    <TokenDetailsScreen
      title="Bitcoin"
      hero={
        <TokenDetailsHero
          icon={<BtcAvatarIcon size="xl" />}
          amount={heroAmount}
          amountSuffix="BTC"
          fiatAmount={heroFiat}
          actions={<TokenDetailsActionsRow symbol="BTC" />}
        />
      }
    >
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
        <TokenDetailsRow label="Name" value="Bitcoin (BTC)" />
        <TokenDetailsRow label="Price" value={formatCurrency(price)} />
        <TokenDetailsRow
          label="Price change (24hr)"
          value={
            <styled.span
              textStyle="caption.02"
              color={
                changePercent > 0
                  ? 'green.action-primary-default'
                  : changePercent < 0
                    ? 'red.action-primary-default'
                    : 'ink.text-subdued'
              }
            >
              {priceChangeText}
            </styled.span>
          }
        />
        <TokenDetailsRow label="Layer" value="Layer 1 (Bitcoin)" />
        <TokenDetailsRow label="Contract details" value="—" />
      </TokenDetailsSection>

      <TokenDetailsSection title="Balances">
        <TokenDetailsBalanceItem
          title="Native Segwit"
          address={account.bitcoin?.zeroIndexNativeSegwitPayerAddress}
          rightTop={`${formatCurrency(nativeSegwitBalance.value.btc.availableBalance, { preset: 'pad-decimals' })}`}
          rightBottom={formatCurrency(nativeSegwitBalance.value.quote.availableBalance)}
        />
        <TokenDetailsBalanceItem
          title="Taproot"
          address={account.bitcoin?.zeroIndexTaprootPayerAddress}
          rightTop={`${formatCurrency(taprootBalance.value.btc.availableBalance, { preset: 'pad-decimals' })}`}
          rightBottom={formatCurrency(taprootBalance.value.quote.availableBalance)}
        />
      </TokenDetailsSection>

      {activity.length ? (
        <TokenDetailsSection title="Activity">
          <Stack>
            {activity.map(item => (
              <Box key={item.key} px="space.05" py="space.03" bg="ink.background-primary">
                <ActivityItem item={item} formatCurrency={formatCurrency} />
              </Box>
            ))}
          </Stack>
        </TokenDetailsSection>
      ) : null}
    </TokenDetailsScreen>
  );
}
