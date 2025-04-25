import { PrivateText } from '@/components/private-text';
import {
  EmptyBalance,
  type TokenBalance as TokenBalanceType,
} from '@/features/balances/token-balance';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';

import { currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { BulletSeparator, SkeletonLoader, Text, TextProps } from '@leather.io/ui/native';
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

interface BalanceProps extends TextProps {
  balance: TokenBalanceType;
  lockedBalance?: string;
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
}: BalanceProps) {
  const isPrivate = usePrivacyMode();
  if (isLoading) {
    return <SkeletonLoader height={20} width={100} isLoading={true} />;
  }
  const hasBalance = balance !== EmptyBalance && typeof balance !== 'string';
  const isFiat = hasBalance && balance.symbol in currencyNameMap;
  const balanceSymbol = hasBalance ? balance.symbol : undefined;
  const maskedCurrencySymbol = !isFiat ? `*${balanceSymbol}` : undefined;

  const formattedBalance =
    balance === EmptyBalance ? EmptyBalance : formatBalance({ balance, isFiat, operator });

  if (!lockedBalance) {
    return (
      <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant}>
        {formattedBalance}
      </PrivateText>
    );
  }

  return (
    <BulletSeparator color={color}>
      <PrivateText mask={maskedCurrencySymbol} color={color} variant={variant}>
        {formattedBalance}
      </PrivateText>
      {!isPrivate ? (
        <Text color={color} variant={variant}>
          {lockedBalance}
          {t({
            id: 'locked',
            message: 'locked',
          })}
        </Text>
      ) : null}
    </BulletSeparator>
  );
}
