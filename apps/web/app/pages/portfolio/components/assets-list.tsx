import { useMemo } from 'react';

import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { RuneAsset, Sip10Asset } from '@leather.io/models';
import { RuneBalance, Sip10Balance } from '@leather.io/services';

interface AssetItemProps {
  name: string;
  symbol: string;
  balance: string;
  value: string;
}

function AssetItem({ name, symbol, balance, value }: AssetItemProps) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      py="space.04"
      px="space.05"
      borderBottom="default"
      _hover={{ bg: 'ink.background-secondary' }}
      cursor="pointer"
    >
      <Flex alignItems="center" gap="space.04">
        <Box w="40px" h="40px" borderRadius="full" bg="ink.background-secondary" border="default" />
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
        <styled.p textStyle="body.02" fontWeight="medium">
          {value}
        </styled.p>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {balance}
        </styled.span>
      </Flex>
    </Flex>
  );
}

function isRuneAsset(asset: Sip10Asset | RuneAsset): asset is RuneAsset {
  return 'runeName' in asset;
}

function getAssetName(asset: Sip10Asset | RuneAsset): string {
  return isRuneAsset(asset) ? asset.runeName : asset.name;
}

function sortAssetsByValue(a: Sip10Balance | RuneBalance, b: Sip10Balance | RuneBalance) {
  const aValue = Number(a.quote.availableBalance.amount);
  const bValue = Number(b.quote.availableBalance.amount);

  if (bValue !== aValue) {
    return bValue - aValue;
  }

  return a.asset.symbol.localeCompare(b.asset.symbol);
}

export function AssetsList(props: BoxProps) {
  const sip10Query = useSip10AccountBalance();

  const assets = useMemo(() => {
    const sip10Assets = sip10Query.data?.sip10s ?? [];

    return sip10Assets.sort(sortAssetsByValue);
  }, [sip10Query.data]);

  const isLoading = sip10Query.isPending;

  const assetItems: AssetItemProps[] = assets.map(asset => ({
    name: getAssetName(asset.asset),
    symbol: asset.asset.symbol,
    balance: formatCurrency(asset.crypto.availableBalance, { showCurrency: false }),
    value: formatCurrency(asset.quote.availableBalance),
  }));

  return (
    <Box borderRadius="sm" border="default" overflow="hidden" {...props}>
      <Box bg="ink.background-secondary" px="space.05" py="space.03">
        <Flex justifyContent="space-between" alignItems="center">
          <styled.p textStyle="label.02" color="ink.text-subdued">
            Asset
          </styled.p>
          <styled.p textStyle="label.02" color="ink.text-subdued">
            Value
          </styled.p>
        </Flex>
      </Box>

      {isLoading ? (
        <Box p="space.06" textAlign="center">
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Loading assets...
          </styled.p>
        </Box>
      ) : assetItems.length > 0 ? (
        assetItems.map((asset, index) => <AssetItem key={index} {...asset} />)
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
