import { PrivateText } from '@/components/private-text';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';

import { currencyDecimalsMap, currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { BulletSeparator, SkeletonLoader, Text, TextProps } from '@leather.io/ui/native';
import { formatMoneyWithoutSymbol, i18nFormatCurrency } from '@leather.io/utils';

const EmptyBalanceDisplay = '-.--';
interface FormatBalanceProps {
  balance: Money;
  isFiat: boolean;
  operator?: string;
}
export function formatBalance({ balance, isFiat, operator }: FormatBalanceProps) {
  if ((isFiat && balance.symbol === 'XBT') || balance.symbol === 'sats') {
    const formattedAmount = balance.amount
      .shiftedBy(-balance.decimals)
      .toFixed(currencyDecimalsMap[balance.symbol]!);
    return operator
      ? `${operator} ${formattedAmount} ${balance.symbol === 'XBT' ? 'BTC' : balance.symbol}`
      : `${formattedAmount} ${balance.symbol === 'XBT' ? 'BTC' : balance.symbol}`;
  }

  if (isFiat) {
    const isLargeBalance = balance.amount.isGreaterThanOrEqualTo(100_000);
    return operator
      ? `${operator} ${i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals)}`
      : i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals);
  }

  return formatMoneyWithoutSymbol(balance);
}

interface BalanceProps extends TextProps {
  balance?: Money;
  lockedBalance?: Money;
  operator?: string;
  isLoading?: boolean;
}
export function Balance({
  balance,
  lockedBalance,
  operator,
  variant = 'label01',
  color = 'ink.text-primary',
  isLoading,
  ...props
}: BalanceProps) {
  const isPrivate = usePrivacyMode();
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

  const formattedBalance = formatBalance({ balance, isFiat, operator });

  if (!lockedBalance) {
    return (
      <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant} {...props}>
        {formatBalance({ balance, isFiat, operator })}
      </PrivateText>
    );
  }

  const lockedBalanceFormatted = formatBalance({ balance: lockedBalance, isFiat, operator });

  return (
    <BulletSeparator color={color}>
      <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant} {...props}>
        {formattedBalance}
      </PrivateText>
      {!isPrivate && (
        <Text color={color} variant={variant} {...props}>
          {`${lockedBalanceFormatted} ${t({
            id: 'locked',
            message: 'locked',
          })}`}
        </Text>
      )}
    </BulletSeparator>
  );
}
