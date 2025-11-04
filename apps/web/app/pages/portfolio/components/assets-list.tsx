import { useMemo } from 'react';

import { Box, BoxProps, Flex, FlexProps, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { CryptoAssetBalance, Sip10Asset, StxAsset, isStxAsset } from '@leather.io/models';
import { Sip10AvatarIcon, StxAvatarIcon } from '@leather.io/ui';

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
  const name = isStxAsset(asset.asset) ? 'Stacks' : asset.asset.name;
  const symbol = asset.asset.symbol;
  const balance = formatCurrency(asset.crypto.availableBalance, { showCurrency: false });
  const value = formatCurrency(asset.quote.availableBalance);

  return (
    <Flex justifyContent="space-between" alignItems="center" py="space.03" {...props}>
      <Flex alignItems="center" gap="space.04">
        <Box>
          <AssetItemIcon asset={asset} />
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

interface AssetsListProps extends BoxProps {
  assets: PortfolioAsset[];
}

function sortAssetsByValue(a: PortfolioAsset, b: PortfolioAsset) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);

  if (bValue !== aValue) return bValue - aValue;

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList(props: AssetsListProps) {
  const { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol } = usePortfolioEvents();
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
          const key = isStxAsset(asset.asset) ? 'STX' : asset.asset.contractId;

          const allocation =
            totalValue > 0 ? (Number(asset.quote.availableBalance.amount) / totalValue) * 100 : 0;

          return (
            <AssetItem
              key={key || index}
              asset={asset}
              allocation={allocation}
              opacity={!hoveredSymbol || hoveredSymbol === asset.asset.symbol ? 1 : 0.6}
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
