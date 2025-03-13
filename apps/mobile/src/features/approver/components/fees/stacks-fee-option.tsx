import { formatBalance } from '@/components/balance/balance';

import { FeeTypes, Money } from '@leather.io/models';

import { getStacksFeeData } from '../../utils';
import { BaseFeeOption } from './base-fee-option';

interface StacksFeeOptionProps {
  feeType: FeeTypes;
  fee: Money;
  usd: Money;
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
}

export function StacksFeeOption({
  feeType,
  fee,
  usd,
  onPress,
  isSelected,
  disabled,
}: StacksFeeOptionProps) {
  return (
    <BaseFeeOption
      onPress={onPress}
      isSelected={isSelected}
      disabled={disabled}
      icon={getStacksFeeData(feeType).icon}
      title={getStacksFeeData(feeType).title}
      time={getStacksFeeData(feeType).time}
      balance={formatBalance({ balance: fee, isFiat: false })}
      balanceUsd={formatBalance({ balance: usd, isFiat: true })}
    />
  );
}
