import { AmountSendMaxButton } from '@/components/amount-field/amount-send-max-button';

import { Box, Theme } from '@leather.io/ui/native';

import { AmountFieldPrimaryValue } from './amount-field-primary-value';
import { AmountFieldSecondaryValue } from './amount-field-secondary-value';

type CurrencyMode = 'crypto' | 'fiat'; // TODO: Should be moved into containing form types
type InternalState = 'initial' | 'active' | 'invalid';

interface AmountFieldProps {
  inputValue: string;
  invalid: boolean;
  currencyMode: CurrencyMode;
  onCurrencyModeChange(currencyMode: CurrencyMode, newInputValue: string): void;
  onSetIsSendingMax(): void;
  formatValue(value: string, mode: CurrencyMode): string;
  calculateSecondaryValue(value: string, currencyMode: CurrencyMode): string;
}

export function AmountField({
  inputValue,
  currencyMode,
  invalid,
  onCurrencyModeChange,
  onSetIsSendingMax,
  calculateSecondaryValue,
  formatValue,
}: AmountFieldProps) {
  const state = evaluateInternalState({ inputValue, invalid });
  const textColor = getTextColor(state);
  const currency = {
    primary: currencyMode,
    secondary: currencyMode === 'crypto' ? 'fiat' : 'crypto',
  } as const;
  const amount = {
    primary: inputValue,
    secondary: calculateSecondaryValue(inputValue, currencyMode),
  };

  function onToggleCurrencyMode() {
    onCurrencyModeChange(currency.secondary, amount.secondary);
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
        <AmountFieldPrimaryValue color={textColor}>
          {formatValue(amount.primary, currency.primary)}
        </AmountFieldPrimaryValue>
        <AmountSendMaxButton onPress={onSetIsSendingMax} />
      </Box>
      <AmountFieldSecondaryValue onToggleCurrencyMode={onToggleCurrencyMode}>
        {formatValue(amount.secondary, currency.secondary)}
      </AmountFieldSecondaryValue>
    </Box>
  );
}

type EvaluateInternalStateParams = Pick<AmountFieldProps, 'invalid' | 'inputValue'>;

function evaluateInternalState({
  invalid,
  inputValue,
}: EvaluateInternalStateParams): InternalState {
  if (invalid) {
    return 'invalid';
  }

  if (inputValue !== '0') {
    return 'active';
  }

  return 'initial';
}

function getTextColor(state: InternalState): keyof Theme['colors'] {
  const colors: Record<InternalState, keyof Theme['colors']> = {
    initial: 'ink.text-subdued',
    active: 'ink.text-primary',
    invalid: 'red.action-primary-default',
  };

  return colors[state];
}
