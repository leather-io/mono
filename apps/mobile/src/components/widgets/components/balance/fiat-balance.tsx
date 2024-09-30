import React, { useMemo } from 'react';

import { PrivateText } from '@/components/private-text';
import { usePrivacyMode } from '@/store/settings/settings.read';
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
  const isPrivate = usePrivacyMode();
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
      <PrivateText color={color} variant={variant}>
        {formattedBalance}
      </PrivateText>
    );
  }

  return (
    <BulletSeparator color={color}>
      <PrivateText color={color} variant={variant}>
        {formattedBalance}
      </PrivateText>
      {!isPrivate ? (
        <Text color={color} variant={variant}>
          {lockedBalance} {t`locked`}
        </Text>
      ) : null}
    </BulletSeparator>
  );
}
