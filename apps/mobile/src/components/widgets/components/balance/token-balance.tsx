import React, { useMemo } from 'react';

import { t } from '@lingui/macro';

import { BulletSeparator, Text } from '@leather.io/ui/native';
import { formatBalance } from '@leather.io/utils';

interface TokenBalanceProps {
  balance: string;
  lockedBalance?: string;
}

export function TokenBalance({ balance, lockedBalance }: TokenBalanceProps) {
  const formattedBalance = useMemo(() => formatBalance(balance.toString()), [balance]);

  if (!lockedBalance) {
    return <Text variant="label01">{formattedBalance.value}</Text>;
  }

  return (
    <BulletSeparator>
      <Text variant="label01">{formattedBalance.value}</Text>
      <Text variant="label01">
        {lockedBalance} {t`locked`}
      </Text>
    </BulletSeparator>
  );
}
