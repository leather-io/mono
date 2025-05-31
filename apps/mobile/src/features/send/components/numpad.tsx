import { useValidateInputDecimalPlaces } from '@/features/send/hooks/use-validate-input-decimal-places';
import { analytics } from '@/utils/analytics';
import BigNumber from 'bignumber.js';
import { funnel } from 'remeda';

import { Currency } from '@leather.io/models';
import { Box, type NumpadProps, Numpad as RawNumpad } from '@leather.io/ui/native';

interface SendFormNumpadProps extends NumpadProps {
  clearSendingMax(): void;
  spendableAmount: BigNumber;
  currency: Currency;
  onBlur(): void;
}

const { call: trackEnterAmountEvent } = funnel(
  (amount: string) => analytics.track('send_amount_entered', { amount }),
  {
    reducer: (_, amount: string) => amount,
    minQuietPeriodMs: 1000,
    triggerAt: 'end',
  }
);

export function Numpad({
  clearSendingMax,
  spendableAmount,
  onChange,
  onBlur,
  currency,
  ...props
}: SendFormNumpadProps) {
  const validateInputDecimalPlaces = useValidateInputDecimalPlaces(currency);

  function handleChange(value: string) {
    if (value !== spendableAmount.toString()) {
      clearSendingMax();
    }

    trackEnterAmountEvent(value);
    onBlur();
    onChange(value);
  }

  return (
    <Box mx="-5">
      <RawNumpad onChange={handleChange} allowNextValue={validateInputDecimalPlaces} {...props} />
    </Box>
  );
}
