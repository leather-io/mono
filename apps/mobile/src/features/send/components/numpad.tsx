import { useValidateInputDecimalPlaces } from '@/features/send/hooks/use-validate-input-decimal-places';
import BigNumber from 'bignumber.js';

import { Currency } from '@leather.io/models';
import { Box, type NumpadProps, Numpad as RawNumpad } from '@leather.io/ui/native';

interface SendFormNumpadProps extends NumpadProps {
  clearSendingMax(): void;
  spendableAmount: BigNumber;
  currency: Currency;
  onBlur(): void;
}

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

    onBlur();
    onChange(value);
  }

  return (
    <Box mx="-5">
      <RawNumpad onChange={handleChange} allowNextValue={validateInputDecimalPlaces} {...props} />
    </Box>
  );
}
