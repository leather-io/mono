import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';
import { formatCurrency } from '~/utils/currency-formatter';

import { Money } from '@leather.io/models';

interface PortfolioSummaryProps extends BoxProps {
  balance?: Money;
}
export function PortfolioSummary({ balance, ...props }: PortfolioSummaryProps) {
  return (
    <Box {...props}>
      <Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="space.04">
        <Box>
          <styled.h3 textStyle="label.03" color="ink.text-subdued" mb="space.02">
            Total balance
          </styled.h3>
          <styled.p textStyle="heading.03">{balance ? formatCurrency(balance) : '$–.––'}</styled.p>
        </Box>
      </Flex>
    </Box>
  );
}
