import { PrivateText } from '@/components/private-text';
import { formatCurrency } from '@/utils/currency-formatter';

import { Money } from '@leather.io/models';
import { SkeletonLoader, Text, TextProps } from '@leather.io/ui/native';
import { FormatAmountOptions } from '@leather.io/utils';

const EmptyBalanceDisplay = '-.--';

interface BalanceProps extends TextProps {
  balance?: Money;
  operator?: string;
  isLoading?: boolean;
  formattingOptions?: FormatAmountOptions;
  forceVisible?: boolean;
}

export function Balance({
  balance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  isLoading,
  formattingOptions,
  forceVisible = false,
  ...props
}: BalanceProps) {
  if (isLoading) {
    return <SkeletonLoader height={20} width={100} isLoading />;
  }

  const DisplayText = forceVisible ? Text : PrivateText;

  if (!balance) {
    return (
      <DisplayText color={color} variant={variant}>
        {EmptyBalanceDisplay}
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
