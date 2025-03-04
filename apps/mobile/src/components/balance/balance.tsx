import { PrivateText } from '@/components/private-text';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { currencyNameMap } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { BulletSeparator, Text, TextProps } from '@leather.io/ui/native';
import { formatMoney, i18nFormatCurrency } from '@leather.io/utils';

interface BalanceProps extends TextProps {
  balance: Money;
  lockedBalance?: string;
}

export function formatBalance(balance: Money, isFiat: boolean) {
  if (isFiat) {
    const isLargeBalance = balance.amount.isGreaterThanOrEqualTo(100_000);
    return i18nFormatCurrency(balance, isLargeBalance ? 0 : balance.decimals);
  }

  return formatMoney(balance);
}

export function Balance({
  balance,
  lockedBalance,
  variant = 'label01',
  color = 'ink.text-primary',
}: BalanceProps) {
  const { i18n } = useLingui();
  const isPrivate = usePrivacyMode();
  const isFiat = balance.symbol in currencyNameMap;
  const formattedBalance = formatBalance(balance, isFiat);
  const privateText = isFiat ? undefined : `*${i18n._(balance.symbol)}`;

  if (!lockedBalance) {
    return (
      <PrivateText mask={privateText} color={color} variant={variant}>
        {formattedBalance}
      </PrivateText>
    );
  }

  return (
    <BulletSeparator color={color}>
      <PrivateText mask={privateText} color={color} variant={variant}>
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
