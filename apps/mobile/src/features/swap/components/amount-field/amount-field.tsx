import { AmountFieldCaret } from '@/features/swap/components/amount-field/amount-field-caret';
import { useAmountField } from '@/features/swap/components/amount-field/use-amount-field';
import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { SecondaryAmount } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';

import { Currency, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { PrimaryValue, formatPrimaryValue } from './amount-field-primary-value';

interface AmountFieldProps {
  asset?: SwappableFungibleCryptoAsset;
  value: string;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch: () => void;
  secondaryAmount: SecondaryAmount;
  quoteCurrencyPreference: Currency;
  invalid?: boolean;
}

export function AmountField({
  asset,
  value,
  secondaryAmount,
  inputCurrencyMode,
  onInputCurrencyModeSwitch,
  quoteCurrencyPreference,
  invalid,
}: AmountFieldProps) {
  const formattedValue = formatPrimaryValue({
    value,
    currency: quoteCurrencyPreference,
    showCurrency: inputCurrencyMode === 'quote',
  });
  const { caretColor, animatedTextStyle } = useAmountField({ asset, invalid, value });

  return (
    <Box gap="3" flex={1} overflow="hidden">
      <PrimaryValue
        value={formattedValue}
        caret={<AmountFieldCaret value={value} color={caretColor} />}
        animatedTextStyle={animatedTextStyle}
      />
      <CurrencyModeSwitcher
        secondaryAmount={secondaryAmount}
        onModeSwitch={onInputCurrencyModeSwitch}
      />
    </Box>
  );
}
