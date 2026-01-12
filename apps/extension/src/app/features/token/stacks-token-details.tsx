import { Box, Stack, styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import { type AccountAddresses } from '@leather.io/models';
import { Callout, StxAvatarIcon } from '@leather.io/ui';
import { createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';

import { ActivityItem } from '../activity-list/components/activity-item';
import { TokenDetailsLoading } from './token-details-loading';
import {
  TokenDetailsActionsRow,
  TokenDetailsBalanceItem,
  TokenDetailsHero,
  TokenDetailsRow,
  TokenDetailsScreen,
  TokenDetailsSection,
} from './token-details-screen.layout';

interface StacksTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

export function StacksTokenDetails({ accountIndex, account }: StacksTokenDetailsProps) {
  const balance = useStxAccountBalance(accountIndex);
  const marketData = useMarketData(stxAsset);
  const description = useAssetDescription(stxAsset);
  const priceChange = usePriceChangePercentage(stxAsset);
  const activityQuery = useActivityByAsset(account, stxAsset);

  if (balance.state === 'loading' || marketData.state === 'loading') {
    return <TokenDetailsLoading title="Stacks" />;
  }

  if (balance.state === 'error' || marketData.state === 'error') {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load Stacks details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const availableBalance = balance.value.stx.availableUnlockedBalance;
  const fiatBalance = balance.value.quote.availableUnlockedBalance;
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
  function getPriceChangeText() {
    if (hasChangePercent && priceChangeDelta) {
      return `${changePercent.toFixed(2)}% (${priceChangeDelta})`;
    }
    if (hasChangePercent) {
      return `${changePercent.toFixed(2)}%`;
    }
    return '—';
  }
  const priceChangeText = getPriceChangeText();

  function getPriceChangeColor(change: number) {
    if (change > 0) return 'green.action-primary-default';
    if (change < 0) return 'red.action-primary-default';
    return 'ink.text-subdued';
  }

  return (
    <TokenDetailsScreen
      title="Stacks"
      hero={
        <TokenDetailsHero
          icon={<StxAvatarIcon size="xl" />}
          amount={heroAmount}
          amountSuffix="STX"
          fiatAmount={heroFiat}
          actions={<TokenDetailsActionsRow symbol="STX" />}
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
        <TokenDetailsRow label="Name" value="Stacks (STX)" />
        <TokenDetailsRow label="Price" value={formatCurrency(price)} />
        <TokenDetailsRow
          label="Price change (24hr)"
          value={
            <styled.span textStyle="caption.02" color={getPriceChangeColor(changePercent)}>
              {priceChangeText}
            </styled.span>
          }
        />
        <TokenDetailsRow label="Layer" value="Layer 2 (Stacks)" />
        <TokenDetailsRow label="Contract details" value="—" />
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
