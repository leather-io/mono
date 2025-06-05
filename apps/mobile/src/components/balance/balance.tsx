import { PrivateText } from '@/components/private-text';

import { currencyDecimalsMap, currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { SkeletonLoader, TextProps } from '@leather.io/ui/native';
import { formatMoneyWithoutSymbol, i18nFormatCurrency } from '@leather.io/utils';

import { useBtcConversionUnitFlag } from '../../features/feature-flags';

const EmptyBalanceDisplay = '-.--';

export function isQuoteCryptoCurrency(balance: Money) {
  return balance.symbol in currencyNameMap && balance.symbol === 'BTC';
}

interface FormatBalanceProps {
  balance: Money;
  isQuoteCurrency: boolean;
  operator?: string;
}
export function formatBalance({ balance, isQuoteCurrency, operator }: FormatBalanceProps) {
  if (isQuoteCurrency && isQuoteCryptoCurrency(balance)) {
    const formattedAmount = balance.amount
      .shiftedBy(-balance.decimals)
      .toFixed(currencyDecimalsMap[balance.symbol]!);
    return operator ? `${operator} ${formattedAmount} BTC` : `${formattedAmount} BTC`;
  }

  if (isQuoteCurrency) {
    const isLargeBalance = balance.amount.isGreaterThanOrEqualTo(100_000);
    return operator
      ? `${operator} ${i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals)}`
      : i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals);
  }

  return formatMoneyWithoutSymbol(balance);
}

interface BalanceProps extends TextProps {
  balance?: Money;
  operator?: string;
  isLoading?: boolean;
  isQuoteCurrency?: boolean;
}
export function Balance({
  balance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  isLoading,
  isQuoteCurrency = false,
  ...props
}: BalanceProps) {
  const btcConversionUnitFlag = useBtcConversionUnitFlag();
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

  const maskedCurrencySymbol = !isQuoteCurrency ? `*${balance.symbol}` : undefined;

  return (
    <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant} {...props}>
      {formatBalance({
        balance,
        isQuoteCurrency: isQuoteCurrency && btcConversionUnitFlag,
        operator,
      })}
    </PrivateText>
  );
}
