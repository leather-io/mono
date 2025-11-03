import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';

interface AssetItemProps {
  name: string;
  symbol: string;
  balance: string;
  value: string;
  change?: string;
}

function AssetItem({ name, symbol, balance, value, change }: AssetItemProps) {
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
        <Flex alignItems="center" gap="space.02">
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {balance}
          </styled.span>
          {change && (
            <styled.span
              textStyle="caption.01"
              color={
                change.startsWith('+')
                  ? 'green.action-primary-default'
                  : 'red.action-primary-default'
              }
            >
              {change}
            </styled.span>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export function AssetsList(props: BoxProps) {
  const sampleAssets: AssetItemProps[] = [
    { name: 'Bitcoin', symbol: 'BTC', balance: '0.00 BTC', value: '$0.00' },
    { name: 'Stacks', symbol: 'STX', balance: '0.00 STX', value: '$0.00' },
  ];

  return (
    <Box borderRadius="md" border="default" overflow="hidden" {...props}>
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

      {sampleAssets.length > 0 ? (
        sampleAssets.map((asset, index) => <AssetItem key={index} {...asset} />)
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
