import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';

export function PortfolioSummary(props: BoxProps) {
  return (
    <Box borderRadius="sm" border="default" bg="ink.background-secondary" p="space.05" {...props}>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="space.04">
        <Box>
          <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.02">
            Total portfolio value
          </styled.h3>
          <styled.p textStyle="heading.03">$0.00</styled.p>
        </Box>

        <Flex gap="space.06">
          <Box>
            <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.02">
              24h change
            </styled.h3>
            <styled.p textStyle="body.02">—</styled.p>
          </Box>

          <Box>
            <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.02">
              Number of assets
            </styled.h3>
            <styled.p textStyle="body.02">0</styled.p>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
