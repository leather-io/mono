import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { btcAsset } from '@leather.io/constants';
import { type AccountAddresses } from '@leather.io/models';
import { BtcAvatarIcon, Callout, Spinner } from '@leather.io/ui';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useNativeSegwitBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';

import { TokenActivitySection } from './token_activity.layout';
import { TokenHeader } from './token_header.layout';
import { TokenMeta } from './token_meta.layout';

interface BitcoinTokenDetailsProps {
  accountIndex: number;
  account: AccountAddresses;
}

export function BitcoinTokenDetails({ accountIndex, account }: BitcoinTokenDetailsProps) {
  const balance = useNativeSegwitBtcAccountBalance(accountIndex);
  const marketData = useMarketData(btcAsset);
  const description = useAssetDescription(btcAsset);
  const priceChange = usePriceChangePercentage(btcAsset);
  const activityQuery = useActivityByAsset(account, btcAsset);

  if (balance.state === 'loading' || marketData.state === 'loading') {
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (balance.state === 'error' || marketData.state === 'error') {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load Bitcoin details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const availableBalance = balance.value.btc.availableBalance;
  const fiatBalance = balance.value.quote.availableBalance;
  const price = marketData.value.price;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText = description.state === 'success' ? description.value.description : '';
  const activity = activityQuery.data ?? [];

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<BtcAvatarIcon />}
        name="Bitcoin"
        symbol="BTC"
        availableBalance={availableBalance}
        fiatBalance={fiatBalance}
      />
      <TokenMeta layer="Layer 1 · Bitcoin" price={price} />
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
