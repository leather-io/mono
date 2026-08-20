import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { formatCryptoPrecise, formatCurrency } from '~/utils/currency-formatter';

import type { BlockchainActivityBalanceChange, MarketData, Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { Badge, type BadgeVariant } from './badge';

export const pendingValue = '—';

export function toFiat(
  money: Money | undefined,
  marketData: MarketData | undefined
): Money | undefined {
  if (!money || !marketData || money.symbol !== marketData.pair.base) return undefined;
  return baseCurrencyAmountInQuote(money, marketData);
}

export function moneyWithFiat(money: Money, fiat: Money | undefined): string {
  return fiat
    ? `${formatCryptoPrecise(money)} ≈ ${formatCurrency(fiat)}`
    : formatCryptoPrecise(money);
}

export function balanceChangeValue(change: BlockchainActivityBalanceChange): string {
  const fiat = change.amount.quote.amount.isGreaterThan(0) ? change.amount.quote : undefined;
  return moneyWithFiat(change.amount.crypto, fiat);
}

export function DetailTable({ children }: { children: ReactNode }) {
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      overflow="hidden"
    >
      {children}
    </Box>
  );
}

export function DetailStatusRow({
  label,
  variant,
  highlight = false,
}: {
  label: string;
  variant: BadgeVariant;
  highlight?: boolean;
}) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      px="space.04"
      py="space.03"
      bgImage={highlight ? 'var(--multisig-collecting-wash)' : undefined}
    >
      <styled.span
        textStyle="caption.01"
        color={highlight ? 'orange.text-primary' : 'ink.text-subdued'}
      >
        Status
      </styled.span>
      <Badge variant={variant} label={label} size="sm" />
    </Flex>
  );
}

const StyledLink = styled(Link);

function DetailLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <StyledLink
      to={to}
      borderBottom="1px solid"
      borderColor="ink.text-non-interactive"
      _hover={{ borderColor: 'ink.action-primary-hover' }}
      _focus={{ borderColor: 'ink.action-primary-hover' }}
      outline={0}
    >
      {children}
    </StyledLink>
  );
}

export function DetailLocationRow({
  vault,
  account,
}: {
  vault?: { name: string; to: string };
  account?: { name: string; to: string };
}) {
  if (!vault && !account) return null;
  return (
    <DetailRow label="Vault / Account">
      {vault ? <DetailLink to={vault.to}>{vault.name}</DetailLink> : null}
      {vault && account ? (
        <styled.span mx="space.01" color="ink.text-subdued">
          ·
        </styled.span>
      ) : null}
      {account ? <DetailLink to={account.to}>{account.name}</DetailLink> : null}
    </DetailRow>
  );
}

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      gap="space.04"
      px="space.04"
      py="space.03"
      borderTopWidth="1px"
      borderTopStyle="solid"
      borderTopColor="ink.border-transparent"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <Box textStyle="label.02" textAlign="right" minWidth={0}>
        {children}
      </Box>
    </Flex>
  );
}
