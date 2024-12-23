import { formatBalance } from '@/components/balance/balance';
import { useLingui } from '@lingui/react';

import { FeeTypes, Money } from '@leather.io/models';
import { Avatar, ItemLayout, Pressable } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { getFeeData } from '../utils';

interface FeeOptionProps {
  feeType: FeeTypes;
  fee: number;
  feeRate: number;
  usd: Money;
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
}

export function FeeOption({
  feeType,
  fee,
  feeRate,
  usd,
  onPress,
  isSelected,
  disabled,
}: FeeOptionProps) {
  const { i18n } = useLingui();
  const sats = createMoney(fee, 'BTC');
  return (
    <Pressable
      borderColor={isSelected ? 'ink.text-primary' : 'ink.border-default'}
      borderWidth={1}
      borderRadius="xs"
      flexDirection="row"
      alignItems="center"
      p="3"
      gap="3"
      onPress={onPress}
      disabled={disabled}
    >
      <Avatar>{getFeeData(feeType).icon}</Avatar>
      <ItemLayout
        titleLeft={getFeeData(feeType).title}
        captionLeft={getFeeData(feeType).time}
        titleRight={formatBalance(sats, false)}
        captionRight={i18n._({
          id: 'fees-sheet.fee-rate-caption',
          message: '{feeRate} sats/B · {balanceUsd}',
          values: { feeRate, balanceUsd: formatBalance(usd, true) },
        })}
      />
    </Pressable>
  );
}
