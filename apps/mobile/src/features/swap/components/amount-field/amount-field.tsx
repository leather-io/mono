import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { SecondaryAmount } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';

import { Currency } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { PrimaryValue, formatPrimaryValue } from './amount-field-primary-value';

interface AmountFieldProps {
  value: string;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch: () => void;
  secondaryAmount: SecondaryAmount;
  quoteCurrencyPreference: Currency;
}

export function AmountField({
  value,
  secondaryAmount,
  inputCurrencyMode,
  onInputCurrencyModeSwitch,
  quoteCurrencyPreference,
}: AmountFieldProps) {
  return (
    <Box gap="3" flex={1} overflow="hidden">
      <PrimaryValue
        value={formatPrimaryValue({
          value,
          currency: quoteCurrencyPreference,
          showCurrency: inputCurrencyMode === 'quote',
        })}
      />
      <CurrencyModeSwitcher
        secondaryAmount={secondaryAmount}
        onModeSwitch={onInputCurrencyModeSwitch}
      />
    </Box>
  );
}
