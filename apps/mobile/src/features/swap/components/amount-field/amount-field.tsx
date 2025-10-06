import { AmountFieldCaret } from '@/features/swap/components/amount-field/amount-field-caret';
import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { SecondaryAmount } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';

import { cryptoAssetColors } from '@leather.io/constants';
import { CryptoCurrency, Currency, FungibleCryptoAsset } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { PrimaryValue, formatPrimaryValue } from './amount-field-primary-value';

interface AmountFieldProps {
  asset?: FungibleCryptoAsset;
  value: string;
  inputCurrencyMode: InputCurrencyMode;
  onInputCurrencyModeSwitch: () => void;
  secondaryAmount: SecondaryAmount;
  quoteCurrencyPreference: Currency;
}

export function AmountField({
  asset,
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
        caret={<AmountFieldCaret value={value} color={getCaretColor(asset)} />}
      />
      <CurrencyModeSwitcher
        secondaryAmount={secondaryAmount}
        onModeSwitch={onInputCurrencyModeSwitch}
      />
    </Box>
  );
}

function isAssetColorDefined(code?: CryptoCurrency): code is keyof typeof cryptoAssetColors {
  return code ? code in cryptoAssetColors : false;
}

function getCaretColor(asset?: FungibleCryptoAsset) {
  return isAssetColorDefined(asset?.symbol) ? cryptoAssetColors[asset?.symbol] : undefined;
}
