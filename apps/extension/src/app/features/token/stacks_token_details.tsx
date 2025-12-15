import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { stxAsset } from '@leather.io/constants';
import { type AccountAddresses } from '@leather.io/models';
import { Callout, Spinner, StxAvatarIcon } from '@leather.io/ui';

import { useActivityByAsset } from '@app/query/activity/activity.query';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/common/market-history/market-history.query';
import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';

import { TokenActivitySection } from './token_activity.layout';
import { TokenHeader } from './token_header.layout';
import { TokenMeta } from './token_meta.layout';

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
    return (
      <Box px="space.05" py="space.05" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
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

  return (
    <Stack px="space.05" py="space.05" gap="space.05">
      <TokenHeader
        icon={<StxAvatarIcon />}
        name="Stacks"
        symbol="STX"
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

