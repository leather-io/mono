import { t } from '@lingui/macro';

import { Box, Pressable, Text, Theme } from '@leather.io/ui/native';

import { AmountFieldPrimaryValue } from './amount-field-primary-value';
import { AmountFieldSecondaryValue } from './amount-field-secondary-value';

type CurrencyMode = 'crypto' | 'fiat'; // TODO: Should be moved into containing form types
type InternalState = 'initial' | 'active' | 'invalid';

interface AmountFieldProps {
  inputValue: string;
  invalid: boolean;
  isTouched: boolean;
  currencyMode: CurrencyMode;
  onCurrencyModeChange(currencyMode: CurrencyMode): void;
  formatFiat(value: string): string;
  formatCrypto(value: string): string;
  onSetIsSendingMax(): void;
}

export function AmountField({
  inputValue = '0',
  formatCrypto,
  formatFiat,
  currencyMode,
  invalid,
  isTouched,
  onCurrencyModeChange,
  onSetIsSendingMax,
}: AmountFieldProps) {
  const fiatAmount = formatFiat(inputValue);
  const cryptoAmount = formatCrypto(inputValue);
  const amount = {
    primary: currencyMode === 'crypto' ? cryptoAmount : fiatAmount,
    secondary: currencyMode === 'crypto' ? fiatAmount : cryptoAmount,
  };
  const state = evaluateInternalState({ invalid, isTouched, inputValue });
  const textColor = getTextColor(state);

  function onToggleCurrencyMode() {
    onCurrencyModeChange(currencyMode === 'crypto' ? 'fiat' : 'crypto');
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
        <AmountFieldPrimaryValue value={amount.primary} color={textColor} />
        <Pressable hitSlop={16} onPress={onSetIsSendingMax}>
          <Text variant="label02" textTransform="uppercase">
            {t({
              id: 'send_form.max_label',
              message: 'Max',
            })}
          </Text>
        </Pressable>
      </Box>
      <AmountFieldSecondaryValue
        value={amount.secondary}
        onToggleCurrencyMode={onToggleCurrencyMode}
      />
    </Box>
  );
}

function evaluateInternalState({
  invalid,
  isTouched,
  inputValue,
}: Pick<AmountFieldProps, 'invalid' | 'isTouched' | 'inputValue'>): InternalState {
  if (isTouched && invalid) {
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
