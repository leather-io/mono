import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { type AccountAddresses, type Money } from '@leather.io/models';
import { Callout, RunesAvatarIcon, Spinner } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';

import { TokenActivitySection } from './token-activity.layout';
import { TokenHeader } from './token-header.layout';
import { TokenMeta } from './token-meta.layout';

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

  function getPriceChangeColor(change: number) {
    if (change > 0) return 'green.action-primary-default';
    if (change < 0) return 'red.action-primary-default';
    return 'ink.text-subdued';
  }

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<RunesAvatarIcon />}
        name={asset.spacedRuneName ?? asset.runeName}
        symbol={asset.symbol}
        availableBalance={crypto.availableBalance}
        fiatBalance={quote.availableBalance}
      />
      <TokenMeta layer="Layer 1 · Bitcoin" />
      {descriptionText ? (
        <Stack border="default" borderRadius="md" p="space.04">
          <styled.h2 textStyle="label.02" margin="0">
            Description
          </styled.h2>
          <styled.p textStyle="body.02" margin="0">
            {descriptionText}
          </styled.p>
        </Stack>
      ) : null}
      <Flex justifyContent="space-between">
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          24h change
        </styled.span>
        <styled.span
          textStyle="caption.02"
          color={getPriceChangeColor(changePercent)}
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
      <TokenActivitySection heading="Recent activity" activity={activity} />
    </Stack>
  );
}

export function RuneTokenDetails({ accountIndex, account, assetId }: RuneTokenDetailsProps) {
  const runes = useRunesAccountBalance(accountIndex, { includeHiddenAssets: true });

  if (runes.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
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
