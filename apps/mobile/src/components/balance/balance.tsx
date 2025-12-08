import { PrivateText } from '@/components/private-text';
import { formatCurrency as defaultFormatCurrency } from '@/utils/currency-formatter';
import type { ResponsiveValue } from '@shopify/restyle';

import { addOperator } from '@leather.io/features';
import { Money } from '@leather.io/models';
import { Text, TextProps, type Theme } from '@leather.io/ui/native';
import { FormatAmountOptions } from '@leather.io/utils';

import { emptyAmountPlaceholder } from './constants';

interface BalanceProps extends TextProps {
  balance?: Money;
  operator?: string;
  formattingOptions?: FormatAmountOptions;
  forceVisible?: boolean;
  formatCurrency?(money: Money, options?: FormatAmountOptions): string;
  color?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

export function Balance({
  balance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  formattingOptions,
  forceVisible = false,
  formatCurrency = defaultFormatCurrency,
  ...props
}: BalanceProps) {
  const DisplayText = forceVisible ? Text : PrivateText;

  if (!balance) {
    return (
      <DisplayText color={color} variant={variant}>
        {emptyAmountPlaceholder}
      </DisplayText>
    );
  }

  const formattedBalance = addOperator(formatCurrency(balance, formattingOptions), operator);

  return (
    <DisplayText color={color} variant={variant} {...props}>
      {formattedBalance}
    </DisplayText>
  );
}
