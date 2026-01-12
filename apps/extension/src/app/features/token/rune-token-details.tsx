import { Box, Stack, styled } from 'leather-styles/jsx';

import { type AccountAddresses, type Money } from '@leather.io/models';
import { Callout, RunesAvatarIcon } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';

import { ActivityItem } from '../activity-list/components/activity-item';
import { TokenDetailsLoading } from './token-details-loading';
import {
  TokenDetailsHero,
  TokenDetailsRow,
  TokenDetailsScreen,
  TokenDetailsSection,
} from './token-details-screen.layout';

interface RuneTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
}

interface RuneTokenDetailsContentProps {
  asset: any;
  crypto: { availableBalance: Money };
  quote: { availableBalance: Money };
  account: AccountAddresses;
}

function RuneTokenDetailsContent({ asset, crypto, quote, account }: RuneTokenDetailsContentProps) {
  const description = useAssetDescription(asset);
  const priceChange = usePriceChangePercentage(asset);
  const activityQuery = useActivityByAsset(account, asset);

  const descriptionText = description.state === 'success' ? description.value.description : '';
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const activity = activityQuery.data ?? [];

  const availableBalance = crypto.availableBalance;
  const fiatBalance = quote.availableBalance;
  const name = asset.spacedRuneName ?? asset.runeName;
  const symbol = asset.symbol ?? '';

  const heroAmount = availableBalance.amount
    .shiftedBy(-availableBalance.decimals)
    .toFormat(availableBalance.decimals > 8 ? 8 : availableBalance.decimals);
  const heroFiat = formatCurrency(fiatBalance);

  function getPriceChangeColor(change: number) {
    if (change > 0) return 'green.action-primary-default';
    if (change < 0) return 'red.action-primary-default';
    return 'ink.text-subdued';
  }

  const priceChangeText = changePercent ? `${changePercent.toFixed(2)}%` : '—';

  return (
    <TokenDetailsScreen
      title={name}
      hero={
        <TokenDetailsHero
          icon={<RunesAvatarIcon size="xl" />}
          amount={heroAmount}
          amountSuffix={symbol}
          fiatAmount={heroFiat}
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
        <TokenDetailsRow label="Name" value={`${name} (${symbol})`} />
        <TokenDetailsRow
          label="Price change (24hr)"
          value={
            <styled.span textStyle="caption.02" color={getPriceChangeColor(changePercent)}>
              {priceChangeText}
            </styled.span>
          }
        />
        <TokenDetailsRow label="Layer" value="Layer 1 (Bitcoin)" />
        <TokenDetailsRow label="Protocol" value="Runes" />
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

export function RuneTokenDetails({ accountIndex, account, assetId }: RuneTokenDetailsProps) {
  const runes = useRunesAccountBalance(accountIndex, { includeHiddenAssets: true });

  if (runes.state === 'loading') {
    return <TokenDetailsLoading title="Rune" />;
  }

  if (runes.state === 'error' || !runes.value) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load rune details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const entry = runes.value.runes.find(
    item => serializeAssetId(getAssetId(item.asset)) === assetId
  );

  if (!entry) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Token not found">
          This rune is not available for this account.
        </Callout>
      </Box>
    );
  }

  const { asset, crypto, quote } = entry;

  return <RuneTokenDetailsContent asset={asset} crypto={crypto} quote={quote} account={account} />;
}
