import { PrivateText } from '@/components/private-text';

import { currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { SkeletonLoader, TextProps } from '@leather.io/ui/native';
import { formatMoney, i18nFormatCurrency } from '@leather.io/utils';

const EmptyBalanceDisplay = '-.--';
interface FormatBalanceProps {
  balance: Money;
  isFiat: boolean;
  operator?: string;
}
export function formatBalance({ balance, isFiat, operator }: FormatBalanceProps) {
  if (isFiat) {
    const isLargeBalance = balance.amount.isGreaterThanOrEqualTo(100_000);
    return operator
      ? `${operator} ${i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals)}`
      : i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals);
  }
  // https://github.com/leather-io/mono/pull/1171/files#r2086525143

  /**
 * [operator, formattedValue].filter(Boolean).join(' ')?
Maybe time to look into withPrefix type string helpers.
 */
  return formatMoney(balance);
}

interface BalanceProps extends TextProps {
  balance?: Money;
  operator?: string;
  isLoading?: boolean;
}
export function Balance({
  balance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  isLoading,
  ...props
}: BalanceProps) {
  if (isLoading) {
    return <SkeletonLoader height={20} width={100} isLoading={true} />;
  }
  if (!balance) {
    return (
      <PrivateText color={color} variant={variant}>
        {EmptyBalanceDisplay}
      </PrivateText>
    );
  }

  const isFiat = balance && balance.symbol in currencyNameMap;
  const maskedCurrencySymbol = !isFiat ? `*${balance.symbol}` : undefined;

  return (
    <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant} {...props}>
      {formatBalance({ balance, isFiat, operator })}
    </PrivateText>
  );
}
