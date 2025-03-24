import { formatBalance } from '@/components/balance/balance';
import { useLingui } from '@lingui/react';

import { FeeTypes, Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { getBitcoinFeeData } from '../../utils';
import { BaseFeeOption } from './base-fee-option';

interface BitcoinFeeOptionProps {
  feeType: FeeTypes;
  fee: number;
  feeRate: number;
  fiatFee: Money;
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
}

export function BitcoinFeeOption({
  feeType,
  fee,
  feeRate,
  fiatFee,
  onPress,
  isSelected,
  disabled,
}: BitcoinFeeOptionProps) {
  const { i18n } = useLingui();
  const sats = createMoney(fee, 'BTC');
  return (
    <BaseFeeOption
      onPress={onPress}
      icon={getBitcoinFeeData(feeType).icon}
      title={getBitcoinFeeData(feeType).title}
      time={getBitcoinFeeData(feeType).time}
      isSelected={isSelected}
      disabled={disabled}
      formattedFeeAmount={formatBalance({ balance: sats, isFiat: false })}
      formattedFiatFeeAmount={i18n._({
        id: 'fees-sheet.fee-rate-caption',
        message: '{feeRate} sats/B · {fiatFee}',
        values: { feeRate, fiatFee: formatBalance({ balance: fiatFee, isFiat: true }) },
      })}
    />
  );
}
