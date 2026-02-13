import { type RefObject } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { Box, Flex } from 'leather-styles/jsx';
import { isDefined } from 'remeda';

import { Currency, InputCurrencyMode, SwappableFungibleCryptoAsset } from '@leather.io/models';
import { SecondaryAmount, isUserInputEffectivelyZero } from '@leather.io/state/swap';
import { slidePair } from '@leather.io/ui';

import { CurrencyModeSwitcher } from '../currency-mode-switcher';
import { AmountFieldError } from './amount-field-error';
import { PrimaryValue } from './amount-field-primary-value';

interface AmountFieldProps {
  asset: SwappableFungibleCryptoAsset | undefined;
  value: string;
  onChange(value: string): void;
  secondaryAmount: SecondaryAmount;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch(): void;
  quoteCurrencyPreference: Currency;
  inputRef?: RefObject<HTMLInputElement | null>;
  errorMessage?: string;
}

export function AmountField({
  asset,
  value,
  onChange,
  secondaryAmount,
  inputCurrencyMode,
  onInputCurrencyModeSwitch,
  quoteCurrencyPreference,
  inputRef,
  errorMessage,
}: AmountFieldProps) {
  const showErrorMessage = isDefined(errorMessage) && !isUserInputEffectivelyZero(value);
  const currency = inputCurrencyMode === 'quote' ? quoteCurrencyPreference : undefined;

  return (
    <Flex direction="column" gap="space.03">
      <PrimaryValue
        asset={asset}
        value={value}
        onChange={onChange}
        currency={currency}
        inputRef={inputRef}
        invalid={showErrorMessage}
      />
      <Box height="16px" overflow="hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {showErrorMessage ? (
            <motion.div
              key="error"
              variants={errorMessageAnimation.variants}
              transition={errorMessageAnimation.transition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AmountFieldError message={errorMessage} />
            </motion.div>
          ) : (
            <motion.div
              key="switcher"
              variants={currencyModeSwitchAnimation.variants}
              transition={currencyModeSwitchAnimation.transition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CurrencyModeSwitcher
                secondaryAmount={secondaryAmount}
                onModeSwitch={onInputCurrencyModeSwitch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Flex>
  );
}

const { first: currencyModeSwitchAnimation, second: errorMessageAnimation } = slidePair('right');
