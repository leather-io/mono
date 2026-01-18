import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { isDefined } from 'remeda';

import { Currency, InputCurrencyMode, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { SecondaryAmount, isUserInputEffectivelyZero } from '@leather.io/state/swap';
import { AnimatedBox, Box, slidePair } from '@leather.io/ui/native';

import { AmountFieldCaret } from './amount-field-caret';
import { AmountFieldError } from './amount-field-error';
import { PrimaryValue, formatPrimaryValue } from './amount-field-primary-value';
import { useAmountField } from './use-amount-field';

interface AmountFieldProps {
  asset?: SwappableFungibleCryptoAsset;
  value: string;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch(): void;
  secondaryAmount: SecondaryAmount;
  quoteCurrencyPreference: Currency;
  errorMessage?: string;
}

export function AmountField({
  asset,
  value,
  secondaryAmount,
  inputCurrencyMode,
  onInputCurrencyModeSwitch,
  quoteCurrencyPreference,
  errorMessage,
}: AmountFieldProps) {
  const { caretColor, animatedTextStyle } = useAmountField({
    asset,
    invalid: isDefined(errorMessage),
    value,
  });
  const formattedValue = formatPrimaryValue({
    value,
    currency: quoteCurrencyPreference,
    showCurrency: inputCurrencyMode === 'quote',
  });
  const showErrorMessage = isDefined(errorMessage) && !isUserInputEffectivelyZero(value);

  return (
    <Box gap="3" flex={1} overflow="hidden">
      <PrimaryValue
        value={formattedValue}
        caret={<AmountFieldCaret value={value} color={caretColor} />}
        animatedTextStyle={animatedTextStyle}
      />
      <Box height={16}>
        {showErrorMessage ? (
          <AnimatedBox
            key={1}
            entering={errorMessageAnimation.entering}
            exiting={errorMessageAnimation.exiting}
          >
            <AmountFieldError message={errorMessage} />
          </AnimatedBox>
        ) : (
          <AnimatedBox
            key={2}
            entering={currencyModeSwitchAnimation.entering}
            exiting={currencyModeSwitchAnimation.exiting}
          >
            <CurrencyModeSwitcher
              secondaryAmount={secondaryAmount}
              onModeSwitch={onInputCurrencyModeSwitch}
            />
          </AnimatedBox>
        )}
      </Box>
    </Box>
  );
}

const { first: currencyModeSwitchAnimation, second: errorMessageAnimation } = slidePair('right');
