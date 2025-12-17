import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { type AccountAddresses } from '@leather.io/models';
import { Callout, Sip10AvatarIcon, Spinner } from '@leather.io/ui';
import { type SerializedCryptoAssetId, getAssetId, serializeAssetId } from '@leather.io/utils';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { TokenActivitySection } from './token_activity.layout';
import { TokenHeader } from './token_header.layout';
import { TokenMeta } from './token_meta.layout';

interface Sip10TokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
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

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={
          <Sip10AvatarIcon
            contractId={asset.assetId}
            imageCanonicalUri={asset.imageCanonicalUri}
            name={asset.name}
          />
        }
        name={asset.name}
        symbol={asset.symbol}
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
      />
      <TokenMeta layer="Layer 2 · Stacks" price={price} />
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
          color={
            changePercent > 0
              ? 'green.action-primary-default'
              : changePercent < 0
                ? 'red.action-primary-default'
                : 'ink.text-subdued'
          }
        >
          {changePercent ? `${changePercent.toFixed(2)}%` : '—'}
        </styled.span>
      </Flex>
      <TokenActivitySection heading="Recent activity" activity={activity} />
    </Stack>
  );
}
