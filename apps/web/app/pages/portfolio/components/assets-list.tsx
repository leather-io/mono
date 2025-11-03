import { useMemo } from 'react';

import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';

interface AssetItemProps {
  asset: Sip10Balance;
  allocation: number;
}

function AssetItem({ asset, allocation }: AssetItemProps) {
  const name = asset.asset.name;
  const symbol = asset.asset.symbol;
  const balance = formatCurrency(asset.crypto.availableBalance, { showCurrency: false });
  const value = formatCurrency(asset.quote.availableBalance);

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      py="space.04"
      px="space.05"
      borderBottom="default"
      _hover={{ bg: 'ink.background-secondary' }}
      cursor="pointer"
      gap="space.04"
    >
      <Flex alignItems="center" gap="space.04" flex="1">
        <Sip10AvatarIcon
          contractId={asset.asset.contractId}
          imageCanonicalUri={asset.asset.imageCanonicalUri || ''}
          name={asset.asset.name}
        />
        <Box>
          <styled.p textStyle="body.02" fontWeight="medium">
            {name}
          </styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {symbol}
          </styled.p>
        </Box>
      </Flex>

      <Flex alignItems="center" gap="space.06">
        <Box textAlign="right" minW="80px">
          <styled.p textStyle="body.02" fontWeight="medium">
            {allocation.toFixed(1)}%
          </styled.p>
        </Box>
        <Flex alignItems="flex-end" flexDir="column" gap="space.01" minW="120px">
          <styled.p textStyle="body.02" fontWeight="medium">
            {value}
          </styled.p>
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

  if (bValue !== aValue) {
    return bValue - aValue;
  }

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList(props: BoxProps) {
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
    <Box borderRadius="sm" border="default" overflow="hidden" {...props}>
      <Box bg="ink.background-secondary" px="space.05" py="space.03">
        <Flex justifyContent="space-between" alignItems="center" gap="space.04">
          <styled.p textStyle="label.02" color="ink.text-subdued" flex="1">
            Asset
          </styled.p>
          <Flex alignItems="center" gap="space.06">
            <styled.p textStyle="label.02" color="ink.text-subdued" minW="80px" textAlign="right">
              Allocation
            </styled.p>
            <styled.p textStyle="label.02" color="ink.text-subdued" minW="120px" textAlign="right">
              Value
            </styled.p>
          </Flex>
        </Flex>
      </Box>

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
          return <AssetItem key={index} asset={asset} allocation={allocation} />;
        })
      ) : (
        <Box p="space.06" textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            No assets to display
          </styled.p>
        </Box>
      )}
    </Box>
  );
}
