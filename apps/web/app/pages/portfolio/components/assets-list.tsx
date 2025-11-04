import { useMemo } from 'react';

import { Box, BoxProps, Flex, FlexProps, styled } from 'leather-styles/jsx';
import { formatCurrency } from '~/utils/currency-formatter';

import { CryptoAssetBalance, Sip10Asset, StxAsset, isStxAsset } from '@leather.io/models';
import { LoadingSpinner, Sip10AvatarIcon, StxAvatarIcon } from '@leather.io/ui';

import { usePortfolioEvents } from '../portfolio-events';

export interface PortfolioAsset {
  asset: Sip10Asset | StxAsset;
  crypto: CryptoAssetBalance;
  quote: CryptoAssetBalance;
}

interface AssetItemProps extends FlexProps {
  allocation: number;
  asset: PortfolioAsset;
}

function AssetItemIcon({ asset }: { asset: PortfolioAsset }) {
  const isStx = isStxAsset(asset.asset);
  if (isStx) {
    return <StxAvatarIcon />;
  } else {
    return (
      <Sip10AvatarIcon
        contractId={(asset.asset as Sip10Asset).contractId}
        imageCanonicalUri={(asset.asset as Sip10Asset).imageCanonicalUri}
        name={(asset.asset as Sip10Asset).name}
      />
    );
  }
}

function AssetItem({ asset, ...props }: AssetItemProps) {
  const balance = formatCurrency(asset.crypto.availableBalance, { showCurrency: false });
  const value = formatCurrency(asset.quote.availableBalance);

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      py="space.03"
      pos="relative"
      {...props}
    >
      <Flex alignItems="center" gap="space.04">
        <Box>
          <AssetItemIcon asset={asset} />
        </Box>
        <Box>
          <styled.p textStyle="body.02" fontWeight="medium">
            {asset.asset.name}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {asset.asset.symbol}
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

interface AssetsListProps extends BoxProps {
  assets: PortfolioAsset[];
  isLoading?: boolean;
}

function sortAssetsByValue(a: PortfolioAsset, b: PortfolioAsset) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);

  if (bValue !== aValue) return bValue - aValue;

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList({ assets, isLoading, ...props }: AssetsListProps) {
  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();
  const { totalValue } = useMemo(() => {
    const sorted = assets.sort(sortAssetsByValue);
    const total = sorted.reduce(
      (sum, asset) => sum + Number(asset.quote.availableBalance.amount),
      0
    );
    return { sortedAssets: sorted, totalValue: total };
  }, [assets]);
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
        <Flex
          p="space.06"
          textAlign="center"
          fontSize="24px"
          height="360px"
          justifyContent="center"
        >
          <LoadingSpinner />
        </Flex>
      ) : assets.length > 0 ? (
        assets.map((asset, index) => {
          const key = isStxAsset(asset.asset) ? 'STX' : asset.asset.contractId;

          const allocation =
            totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0;

          return (
            <AssetItem
              key={key || index}
              asset={asset}
              _before={
                hoveredSymbol === asset.asset.symbol
                  ? {
                      content: '""',
                      position: 'absolute',
                      mx: '-space.05',
                      my: 'space.01',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bg: 'ink.component-background-hover',
                      zIndex: 9,
                    }
                  : {}
              }
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
