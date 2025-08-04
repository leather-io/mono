import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { FeeTypes, Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getBitcoinFeeData } from '../../utils';
import { BaseFeeOption } from './base-fee-option';

interface BitcoinFeeOptionProps {
  feeType: FeeTypes;
  fee: number;
  feeRate: number;
  quoteFee: Money;
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
}

export function BitcoinFeeOption({
  feeType,
  fee,
  feeRate,
  quoteFee,
  onPress,
  isSelected,
  disabled,
}: BitcoinFeeOptionProps) {
  const sats = createMoney(fee, 'BTC');
  const formattedQuoteFee = formatCurrency(quoteFee);

  return (
    <BaseFeeOption
      onPress={onPress}
      icon={getBitcoinFeeData(feeType).icon}
      title={getBitcoinFeeData(feeType).title}
      time={getBitcoinFeeData(feeType).time}
      isSelected={isSelected}
      disabled={disabled}
      formattedFeeAmount={formatCurrency(sats)}
      formattedQuoteFeeAmount={t`${feeRate} sats/vB · ${formattedQuoteFee}`}
    />
  );
}
