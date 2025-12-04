import { type HTMLStyledProps, styled } from 'leather-styles/jsx';



import { addOperator } from '@leather.io/features';
import { Money } from '@leather.io/models';
import { type FormatAmountOptions } from '@leather.io/utils';



import { EmptyAmountPlaceholder } from './constants';





interface BalanceProps extends HTMLStyledProps<'span'> {
  balance?: Money;
  operator?: string;
  formattingOptions?: FormatAmountOptions;
  formatCurrency(money: Money, options?: FormatAmountOptions): string;
}

export function Balance({
  balance,
  operator,
  formattingOptions,
  formatCurrency,
  ...props
}: BalanceProps) {
  if (!balance) return <styled.span {...props}>{EmptyAmountPlaceholder}</styled.span>;

  const formattedBalance = addOperator(formatCurrency(balance, formattingOptions), operator);

  return <styled.span {...props}>{formattedBalance}</styled.span>;
}