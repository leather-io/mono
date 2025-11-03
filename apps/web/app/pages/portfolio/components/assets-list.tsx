import { useMemo } from 'react';

import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { useSip10AccountBalance } from '~/queries/balance/sip10-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

import { Sip10Balance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui';

interface AssetItemProps {
  asset: Sip10Balance;
}

function AssetItem({ asset }: AssetItemProps) {
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
    >
      <Flex alignItems="center" gap="space.04">
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

  const assets = useMemo(() => {
    const sip10Assets = sip10Query.data?.sip10s ?? [];
    return sip10Assets.sort(sortAssetsByValue);
  }, [sip10Query.data]);

  const isLoading = sip10Query.isPending;

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
      ) : assets.length > 0 ? (
        assets.map((asset, index) => <AssetItem key={index} asset={asset} />)
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
