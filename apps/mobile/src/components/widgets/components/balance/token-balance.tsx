import React from 'react';

import { t } from '@lingui/macro';

import { BulletSeparator, Text } from '@leather.io/ui/native';

interface TokenBalanceProps {
  balance: string;
  lockedBalance?: string;
}

export function TokenBalance({ balance, lockedBalance }: TokenBalanceProps) {
  if (!lockedBalance) {
    return <Text variant="label01">{balance}</Text>;
  }

  return (
    <BulletSeparator>
      <Text variant="label01">{balance}</Text>
      <Text variant="label01">
        {lockedBalance} {t`locked`}
      </Text>
    </BulletSeparator>
  );
}
