import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { Money } from '@leather.io/models';
import { type FormatAmountOptions } from '@leather.io/utils';

import { PrivateText } from '../privacy/private-text';
import { EmptyAmountPlaceholder } from './constants';

interface BalanceProps extends HTMLStyledProps<'span'> {
  balance?: Money;
  operator?: string;
  formattingOptions?: FormatAmountOptions;
  forceVisible?: boolean;
  formatCurrency(money: Money, options?: FormatAmountOptions): string;
}

export function Balance({
  balance,
  operator,
  formattingOptions,
  forceVisible = false,
  formatCurrency,
  ...props
}: BalanceProps) {
  const DisplayText = forceVisible ? styled.span : PrivateText;

  if (!balance) {
    return <DisplayText {...props}>{EmptyAmountPlaceholder}</DisplayText>;
  }

  const formattedBalance = addOperator(formatCurrency(balance, formattingOptions), operator);

  return <DisplayText {...props}>{formattedBalance}</DisplayText>;
}

function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}
