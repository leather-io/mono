import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

interface TokenOverviewProps {
  icon: ReactNode;
  availableBalance: Money;
  symbol?: string;
  fiatBalance: Money;
  actions?: ReactNode;
}

export function TokenOverview({
  icon,
  availableBalance,
  symbol,
  fiatBalance,
  actions,
}: TokenOverviewProps) {
  return (
    <Stack
      bg="ink.background-primary"
      alignItems="center"
      justifyContent="center"
      p="space.05"
      gap="space.03"
      data-testid="token-overview"
    >
      <Box>{icon}</Box>
      <Stack gap="space.00" alignItems="center">
        <styled.div textStyle="heading.03" data-testid="token-overview-amount">
          {formatCurrency(availableBalance, { showCurrency: false })}
          {symbol && <styled.span color="ink.text-subdued-secondary"> {symbol}</styled.span>}
        </styled.div>
        <styled.div
          textStyle="label.01"
          color="ink.text-primary"
          data-testid="token-overview-fiat-amount"
        >
          {formatCurrency(fiatBalance)}
        </styled.div>
      </Stack>
      {actions}
    </Stack>
  );
}
