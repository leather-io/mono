import { useMemo } from 'react';

import { Box, BoxProps, Flex, FlexProps, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';

import { usePortfolioEvents } from '../portfolio-events';

interface AssetItemProps extends FlexProps {
  asset: Sip10Balance;
  allocation: number;
}

function AssetItem({ asset, allocation, ...props }: AssetItemProps) {
  const name = asset.asset.name;
  const symbol = asset.asset.symbol;
  const balance = formatCurrency(asset.crypto.availableBalance, { showCurrency: false });
  const value = formatCurrency(asset.quote.availableBalance);

  return (
    <Flex justifyContent="space-between" alignItems="center" py="space.03" {...props}>
      <Flex alignItems="center" gap="space.04">
        <Box>
          <Sip10AvatarIcon
            contractId={asset.asset.contractId}
            imageCanonicalUri={asset.asset.imageCanonicalUri}
            name={asset.asset.name}
          />
        </Box>
        <Box>
          <styled.p textStyle="body.02" fontWeight="medium">
            {name}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {symbol}
          </styled.p>
        </Box>
      </Flex>

      <Flex alignItems="flex-end" flexDir="column" gap="space.01">
        <styled.p textStyle="body.02">{value}</styled.p>
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {balance}
          </styled.span>
        </Flex>
      </Flex>
    </Flex>
  );
}

function sortAssetsByValue(a: Sip10Balance, b: Sip10Balance) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);

  if (bValue !== aValue) return bValue - aValue;

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList(props: BoxProps) {
  const { emitAssetHoverOn, emitAssetHoverOff } = usePortfolioEvents(symbol => {
    console.log('element hovered on listener list', symbol);
  });
  const sip10Query = useSip10AccountBalance();

  const { assets, totalValue } = useMemo(() => {
    const sip10Assets = sip10Query.data?.sip10s ?? [];
    const sorted = sip10Assets.sort(sortAssetsByValue);
    const total = sorted.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );
    return { assets: sorted, totalValue: total };
  }, [sip10Query.data]);

  const isLoading = sip10Query.isPending;

  return (
    <Box {...props}>
      <Flex justifyContent="space-between" alignItems="center">
        <styled.p textStyle="label.03" color="ink.text-subdued">
          Asset
        </styled.p>
        <styled.p textStyle="label.03" color="ink.text-subdued">
          Value
        </styled.p>
      </Flex>

      {isLoading ? (
        <Box p="space.06" textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Loading assets...
          </styled.p>
        </Box>
      ) : assets.length > 0 ? (
        assets.map((asset, index) => {
          const allocation =
            totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0;
          return (
            <AssetItem
              key={index}
              asset={asset}
              allocation={allocation}
              onMouseOver={() => emitAssetHoverOn(asset.asset.symbol)}
              onMouseOut={() => emitAssetHoverOff()}
            />
          );
        })
      ) : (
        <Box textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            No assets to display
          </styled.p>
        </Box>
      )}
    </Box>
  );
}
