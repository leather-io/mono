import React, { useMemo } from 'react';

import { Text, TextProps } from '@leather.io/ui/native';

import { formatBalance } from './utils/format-balance';

interface AccountBalanceProps {
  balance: number;
  variant?: TextProps['variant'];
}

export function AccountBalance({ balance, variant = 'label01' }: AccountBalanceProps) {
  const formattedBalance = useMemo(() => formatBalance(balance), [balance]);
  return <Text variant={variant}>{formattedBalance}</Text>;
}
