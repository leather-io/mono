import { FeeTypes, type Money, type StacksTransactionFees } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function getStacksFeesByType(
  fees: StacksTransactionFees | undefined
): Record<FeeTypes, Money> {
  const zeroMoney = createMoney(0, 'STX');
  return {
    [FeeTypes.Low]: fees?.options.low.value ?? zeroMoney,
    [FeeTypes.Middle]: fees?.options.standard.value ?? zeroMoney,
    [FeeTypes.High]: fees?.options.high.value ?? zeroMoney,
    [FeeTypes.Custom]: zeroMoney,
    [FeeTypes.Unknown]: zeroMoney,
  };
}

export function getStacksFeeType(fee: Money, fees: StacksTransactionFees | undefined): FeeTypes {
  if (!fees) return FeeTypes.Custom;
  const { low, standard, high } = fees.options;
  if (fee.amount.isEqualTo(standard.value.amount)) return FeeTypes.Middle;
  if (fee.amount.isEqualTo(low.value.amount)) return FeeTypes.Low;
  if (fee.amount.isEqualTo(high.value.amount)) return FeeTypes.High;
  return FeeTypes.Custom;
}
