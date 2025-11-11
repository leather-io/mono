import { PrivateText } from '@/components/private-text';
import { formatCurrency } from '@/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { Text, TextProps } from '@leather.io/ui/native';
import { FormatAmountOptions } from '@leather.io/utils';

import { EmptyAmountPlaceholder } from './constants';

interface BalanceProps extends TextProps {
  balance?: Money;
  operator?: string;
  formattingOptions?: FormatAmountOptions;
  forceVisible?: boolean;
}

export function Balance({
  balance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  formattingOptions,
  forceVisible = false,
  ...props
}: BalanceProps) {
  const DisplayText = forceVisible ? Text : PrivateText;

  if (!balance) {
    return (
      <DisplayText color={color} variant={variant}>
        {EmptyAmountPlaceholder}
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

function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}
