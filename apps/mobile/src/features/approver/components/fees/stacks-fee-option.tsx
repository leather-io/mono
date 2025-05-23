import { formatBalance } from '@/components/balance/balance';

import { FeeTypes, Money } from '@leather.io/models';

import { getStacksFeeData } from '../../utils';
import { BaseFeeOption } from './base-fee-option';

interface StacksFeeOptionProps {
  feeType: FeeTypes;
  fee: Money;
  fiatFee: Money;
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
}

export function StacksFeeOption({
  feeType,
  fee,
  fiatFee,
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
      formattedFeeAmount={formatBalance({ balance: fee, isFiat: false })}
      formattedFiatFeeAmount={formatBalance({ balance: fiatFee, isFiat: true })}
    />
  );
}
