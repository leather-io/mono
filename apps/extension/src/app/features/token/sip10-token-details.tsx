import { Box, Stack, styled } from 'leather-styles/jsx';

import { type AccountAddresses } from '@leather.io/models';
import type { Sip10Balance } from '@leather.io/services';
import { Callout, Sip10AvatarIcon, Spinner } from '@leather.io/ui';
import {
  type SerializedCryptoAssetId,
  createMoney,
  getAssetId,
  serializeAssetId,
  truncateMiddle,
} from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { ActivityItem } from '../activity-list/components/activity-item';
import {
  TokenDetailsActionsRow,
  TokenDetailsBalanceItem,
  TokenDetailsHero,
  TokenDetailsRow,
  TokenDetailsScreen,
  TokenDetailsSection,
} from './token-details-screen.layout';

interface Sip10TokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

interface Sip10TokenDetailsContentProps {
  account: AccountAddresses;
  entry: Sip10Balance;
}

function Sip10TokenDetailsContent({ account, entry }: Sip10TokenDetailsContentProps) {
  const { asset, crypto, quote } = entry;
  const marketData = useMarketData(asset);
  const description = useAssetDescription(asset);
  const priceChange = usePriceChangePercentage(asset);
  const activityQuery = useActivityByAsset(account, asset);

  const availableBalance = crypto.availableBalance;
  const fiatBalance = quote.availableBalance;
  const price = marketData.state === 'success' ? marketData.value.price : undefined;
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
      title={asset.name}
      hero={
        <TokenDetailsHero
          icon={
            <Sip10AvatarIcon
              contractId={asset.assetId}
              imageCanonicalUri={asset.imageCanonicalUri}
              name={asset.name}
            />
          }
          amount={heroAmount}
          amountSuffix={asset.symbol}
          fiatAmount={heroFiat}
          actions={<TokenDetailsActionsRow symbol={asset.symbol} />}
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
        <TokenDetailsRow label="Name" value={`${asset.name} (${asset.symbol})`} />
        <TokenDetailsRow label="Price" value={price ? formatCurrency(price) : '—'} />
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
        <TokenDetailsRow label="Layer" value="Layer 2 (Stacks)" />
        <TokenDetailsRow label="Contract details" value={truncateMiddle(asset.assetId, 4)} />
      </TokenDetailsSection>

      <TokenDetailsSection title="Balances">
        <TokenDetailsBalanceItem
          title="Stacks"
          address={account.stacks?.stxAddress}
          rightTop={formatCurrency(availableBalance, { preset: 'pad-decimals' })}
          rightBottom={formatCurrency(fiatBalance)}
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

export function Sip10TokenDetails({ accountIndex, account, assetId }: Sip10TokenDetailsProps) {
  const sip10 = useSip10AccountBalance(accountIndex, { includeHiddenAssets: true });
  const entry = sip10.value?.sip10s.find(
    item => serializeAssetId(getAssetId(item.asset)) === assetId
  );

  if (sip10.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (sip10.state === 'error' || !sip10.value || !entry) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load token details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  return <Sip10TokenDetailsContent account={account} entry={entry} />;
}
