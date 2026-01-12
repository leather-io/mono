import { type ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { type Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

interface TokenHeaderProps {
  icon: ReactNode;
  name: string;
  symbol: string;
  availableBalance?: Money;
  fiatBalance?: Money;
}

export function TokenHeader({
  icon,
  name,
  symbol,
  availableBalance,
  fiatBalance,
}: TokenHeaderProps) {
  const formattedAvailable =
    availableBalance &&
    availableBalance.amount
      .shiftedBy(-availableBalance.decimals)
      .toFormat(availableBalance.decimals > 8 ? 8 : availableBalance.decimals);

  const formattedFiat = fiatBalance ? formatCurrency(fiatBalance) : undefined;

  return (
    <Stack gap="space.02">
      <Flex alignItems="center" gap="space.03">
        <Box>{icon}</Box>
        <Box>
          <styled.div textStyle="heading.04">{name}</styled.div>
          <styled.div textStyle="label.02" color="ink.text-subdued">
            {symbol}
          </styled.div>
        </Box>
      </Flex>
      <Flex justifyContent="space-between" alignItems="baseline">
        <styled.div textStyle="heading.04">
          {formattedAvailable ? `${formattedAvailable} ${symbol}` : '—'}
        </styled.div>
        <styled.div textStyle="label.02" color="ink.text-subdued">
          {formattedFiat ?? '—'}
        </styled.div>
      </Flex>
    </Stack>
  );
}
