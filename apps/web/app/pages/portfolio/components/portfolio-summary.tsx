import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { useTotalPortfolioBalance } from '~/queries/balance/total-balance.hooks';
import { formatCurrency } from '~/utils/currency-formatter';

export function PortfolioSummary(props: BoxProps) {
  const totalBalance = useTotalPortfolioBalance();

  return (
    <Box {...props}>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="space.04">
        <Box>
          <styled.h3 textStyle="label.03" color="ink.text-subdued" mb="space.02">
            Total balance
          </styled.h3>
          <styled.p textStyle="heading.04">
            {totalBalance ? formatCurrency(totalBalance) : '$–.––'}
          </styled.p>
        </Box>
      </Flex>
    </Box>
  );
}
