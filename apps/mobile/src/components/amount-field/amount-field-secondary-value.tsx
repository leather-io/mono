import {
  calculateSecondaryValue,
  formatSecondaryValue,
} from '@/components/amount-field/amount-field.utils';
import { InputCurrencyMode } from '@/utils/types';
import { whenInputCurrencyMode } from '@/utils/when-currency-input-mode';

import { CryptoCurrency, FiatCurrency, MarketData } from '@leather.io/models';
import { ArrowTopBottomIcon, Box, Pressable, Text } from '@leather.io/ui/native';

interface AmountFieldSecondaryValueProps {
  primaryValue: string;
  onInputCurrencyModeChange?(inputCurrencyMode: InputCurrencyMode, newInputValue: string): void;
  inputCurrencyModeChangeEnabled?: boolean;
  locale: string;
  inputCurrencyMode: InputCurrencyMode;
  cryptoCurrency: CryptoCurrency;
  fiatCurrency: FiatCurrency;
  marketData: MarketData;
}

export function AmountFieldSecondaryValue({
  primaryValue,
  onInputCurrencyModeChange,
  inputCurrencyModeChangeEnabled,
  inputCurrencyMode,
  fiatCurrency,
  cryptoCurrency,
  marketData,
  locale,
}: AmountFieldSecondaryValueProps) {
  const secondaryValue = calculateSecondaryValue({
    value: primaryValue,
    mode: inputCurrencyMode,
    marketData,
  });
  const displayValue = formatSecondaryValue({
    value: secondaryValue,
    currency: whenInputCurrencyMode(inputCurrencyMode)({
      crypto: fiatCurrency,
      fiat: cryptoCurrency,
    }),
    locale,
  });

  function handleToggleInputCurrencyMode() {
    if (onInputCurrencyModeChange) {
      const nextMode = whenInputCurrencyMode<InputCurrencyMode>(inputCurrencyMode)({
        crypto: 'fiat',
        fiat: 'crypto',
      });
      onInputCurrencyModeChange(nextMode, secondaryValue);
    }
  }

  return (
    <Pressable
      hitSlop={16}
      onPress={inputCurrencyModeChangeEnabled ? handleToggleInputCurrencyMode : undefined}
    >
      <Box flexDirection="row" gap="1" alignItems="center">
        <Text variant="label02" color="ink.text-subdued" numberOfLines={1} ellipsizeMode="clip">
          {displayValue}
        </Text>
        {inputCurrencyModeChangeEnabled ? (
          <ArrowTopBottomIcon color="ink.text-subdued" variant="small" />
        ) : null}
      </Box>
    </Pressable>
  );
}
