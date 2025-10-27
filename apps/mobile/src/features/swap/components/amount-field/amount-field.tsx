import Animated from 'react-native-reanimated';

import { AmountFieldCaret } from '@/features/swap/components/amount-field/amount-field-caret';
import { AmountFieldError } from '@/features/swap/components/amount-field/amount-field-error';
import { useAmountField } from '@/features/swap/components/amount-field/use-amount-field';
import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { SecondaryAmount } from '@/features/swap/swap-state/swap-state.types';
import { isUserInputEffectivelyZero } from '@/features/swap/swap-state/utils/amount-operations';
import { InputCurrencyMode } from '@/utils/types';
import { isDefined } from 'remeda';

import { Currency, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { Box, slidePair } from '@leather.io/ui/native';

import { PrimaryValue, formatPrimaryValue } from './amount-field-primary-value';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AmountFieldProps {
  asset?: SwappableFungibleCryptoAsset;
  value: string;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch: () => void;
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
      <Box height={20}>
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
