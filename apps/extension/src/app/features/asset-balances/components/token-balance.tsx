import { ReactNode } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';
import { LoadingRectangle } from '@app/components/loading-rectangle';
import { PrivateText } from '@app/components/privacy/private-text';

function formatCryptoBalance(money?: Money) {
  if (!money) return '—';
  const value = money.amount.shiftedBy(-money.decimals).toFormat();
  return `${value} ${money.symbol}`;
}

interface TokenBalanceProps {
  icon: ReactNode;
  tokenName: string;
  ticker: string;
  availableBalance?: Money;
  quoteBalance?: Money;
  isLoading?: boolean;
  onClick?(): void;
}

export function TokenBalance({
  icon,
  tokenName,
  ticker,
  availableBalance,
  quoteBalance,
  isLoading,
  onClick,
}: TokenBalanceProps) {
  if (isLoading) {
    return (
      <Stack gap="space.02" width="100%">
        <LoadingRectangle width="100%" height="64px" />
      </Stack>
    );
  }

  return (
    <styled.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      width="100%"
      border="1px solid"
      borderColor="ink.border-transparent"
      borderRadius="12px"
      px="space.04"
      py="space.03"
      bg="ink.background-secondary"
      _hover={{ bg: 'ink.background-primary' }}
      textAlign="left"
    >
      <HStack width="100%" alignItems="center" gap="space.04">
        <Box>{icon}</Box>
        <Stack flex="1" gap="space.01">
          <styled.span textStyle="label.02" color="ink.text-primary">
            {tokenName}
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {ticker}
          </styled.span>
        </Stack>
        <Stack gap="space.01" alignItems="flex-end">
          <Flex>
            <PrivateText>{quoteBalance ? formatCurrency(quoteBalance) : '—'}</PrivateText>
          </Flex>
          <Flex>
            <PrivateText>{formatCryptoBalance(availableBalance)}</PrivateText>
          </Flex>
        </Stack>
      </HStack>
    </styled.button>
  );
}
