import { AmountSendMaxButton } from '@/components/amount-field/amount-send-max-button';
import { InputCurrencyMode } from '@/utils/types';

import { CryptoCurrency, MarketData, QuoteCurrency } from '@leather.io/models';
import { Box, Theme } from '@leather.io/ui/native';

import { AmountFieldPrimaryValue } from './amount-field-primary-value';
import { AmountFieldSecondaryValue } from './amount-field-secondary-value';

type InternalState = 'initial' | 'active' | 'invalid';

export interface AmountFieldProps {
  inputValue: string;
  invalid: boolean;
  isValidating?: boolean;
  inputCurrencyMode: InputCurrencyMode;
  inputCurrencyModeChangeEnabled?: boolean;
  onInputCurrencyModeChange?(inputCurrencyMode: InputCurrencyMode, newInputValue: string): void;
  canSendMax?: boolean;
  isSendingMax?: boolean;
  onSetIsSendingMax?(): void;
  quoteCurrency: QuoteCurrency;
  cryptoCurrency: CryptoCurrency;
  marketData: MarketData;
  locale: string;
}

export function AmountField({
  inputValue,
  inputCurrencyMode,
  invalid,
  isValidating,
  inputCurrencyModeChangeEnabled,
  onInputCurrencyModeChange,
  onSetIsSendingMax,
  cryptoCurrency,
  marketData,
  canSendMax,
  quoteCurrency,
  locale,
}: AmountFieldProps) {
  const state = evaluateInternalState({ inputValue, invalid, isValidating });
  const textColor = getTextColor(state);

  function handleSendMaxPress() {
    if (!onSetIsSendingMax) {
      return;
    }

    onSetIsSendingMax();
  }

  return (
    <Box
      borderColor="ink.border-default"
      borderBottomStartRadius="sm"
      borderBottomEndRadius="sm"
      borderWidth={1}
      gap="2"
      p="4"
    >
      <Box flexDirection="row" gap="4" justifyContent="space-between">
        <AmountFieldPrimaryValue
          color={textColor}
          value={inputValue}
          quoteCurrency={quoteCurrency}
          inputCurrencyMode={inputCurrencyMode}
          cryptoCurrency={cryptoCurrency}
          locale={locale}
        />
        {canSendMax && <AmountSendMaxButton onPress={handleSendMaxPress} />}
      </Box>
      <AmountFieldSecondaryValue
        onInputCurrencyModeChange={onInputCurrencyModeChange}
        inputCurrencyModeChangeEnabled={inputCurrencyModeChangeEnabled}
        primaryValue={inputValue}
        quoteCurrency={quoteCurrency}
        inputCurrencyMode={inputCurrencyMode}
        cryptoCurrency={cryptoCurrency}
        locale={locale}
        marketData={marketData}
      />
    </Box>
  );
}

type EvaluateInternalStateParams = Pick<
  AmountFieldProps,
  'invalid' | 'inputValue' | 'isValidating'
>;

function evaluateInternalState({
  invalid,
  inputValue,
  isValidating,
}: EvaluateInternalStateParams): InternalState {
  if (inputValue === '0') {
    return 'initial';
  }

  if (/^0\.0*$/.test(inputValue)) {
    return 'active';
  }

  if (invalid && !isValidating) {
    return 'invalid';
  }

  return 'active';
}

function getTextColor(state: InternalState): keyof Theme['colors'] {
  const colors: Record<InternalState, keyof Theme['colors']> = {
    initial: 'ink.text-subdued',
    active: 'ink.text-primary',
    invalid: 'red.action-primary-default',
  };

  return colors[state];
}
