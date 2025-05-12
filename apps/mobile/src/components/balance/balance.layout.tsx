import { PrivateText } from '@/components/private-text';

import { currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { TextProps } from '@leather.io/ui/native';
import { formatMoneyWithoutSymbol, i18nFormatCurrency } from '@leather.io/utils';

interface FormatBalanceProps {
  balance: Money;
  isFiat: boolean;
  operator?: string;
}
export function formatBalance({ balance, isFiat, operator }: FormatBalanceProps) {
  if (isFiat) {
    const isLargeBalance = balance.amount.isGreaterThanOrEqualTo(100_000);
    return i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals);
  }

  return operator
    ? `${operator} ${formatMoneyWithoutSymbol(balance)}`
    : formatMoneyWithoutSymbol(balance);
}

interface BalanceLayoutProps extends TextProps {
  balance: Money;
  operator?: string;
}
export function BalanceLayout({ balance, operator, ...props }: BalanceLayoutProps) {
  const isFiat = balance.symbol in currencyNameMap;
  const maskedCurrencySymbol = !isFiat ? `*${balance.symbol}` : undefined;

  const formattedBalance = formatBalance({ balance, isFiat, operator });

  return (
    <PrivateText mask={maskedCurrencySymbol} {...props}>
      {formattedBalance}
    </PrivateText>
  );
}

export function ActivityWidgetBalance({ balance, operator, ...props }: BalanceLayoutProps) {
  return (
    <BalanceLayout
      balance={balance}
      operator={operator}
      lineHeight={20}
      fontSize={15}
      fontWeight={400}
      {...props}
    />
  );
}
