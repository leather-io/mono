import React, { useMemo } from 'react';

import { t } from '@lingui/macro';

import { BulletSeparator, Text, TextProps } from '@leather.io/ui/native';
import { formatBalance } from '@leather.io/utils';

interface FiatBalanceProps {
  balance: number | string;
  lockedBalance?: string;
  variant?: TextProps['variant'];
  color?: TextProps['color'];
}

export function FiatBalance({
  balance,
  lockedBalance,
  variant = 'label01',
  color = 'ink.text-primary',
}: FiatBalanceProps) {
  // FIXME: currencyLabel should be dynamic based on the user's currency
  const currencyLabel = '$';
  const formattedBalance = useMemo(
    () =>
      typeof balance === 'number'
        ? `${currencyLabel}${formatBalance(balance.toString()).value}`
        : balance,
    [balance]
  );

  if (!lockedBalance) {
    return (
      <Text variant={variant} color={color}>
        {formattedBalance}
      </Text>
    );
  }

  return (
    <BulletSeparator color={color}>
      <Text variant={variant} color={color}>
        {formattedBalance}
      </Text>
      <Text variant={variant} color={color}>
        {lockedBalance} {t`locked`}
      </Text>
    </BulletSeparator>
  );
}
