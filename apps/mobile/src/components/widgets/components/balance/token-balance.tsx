import { PrivateText } from '@/components/private-text';
import { usePrivacyMode } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { Money } from '@leather.io/models';
import { BulletSeparator, Text } from '@leather.io/ui/native';
import { formatMoney } from '@leather.io/utils';

interface TokenBalanceProps {
  availableBalance: Money;
  lockedBalance?: string;
}

export function TokenBalance({ availableBalance, lockedBalance }: TokenBalanceProps) {
  const { i18n } = useLingui();
  const isPrivate = usePrivacyMode();
  const formattedBalance = formatMoney(availableBalance);

  const privateText = `*${i18n._(availableBalance.symbol)}`;

  if (!lockedBalance) {
    return (
      <PrivateText customPrivateText={privateText} variant="label01">
        {formattedBalance}
      </PrivateText>
    );
  }

  return (
    <BulletSeparator>
      <PrivateText customPrivateText={privateText} variant="label01">
        {formattedBalance}
      </PrivateText>
      {!isPrivate ? (
        <Text variant="label01">
          {lockedBalance} {t`locked`}
        </Text>
      ) : null}
    </BulletSeparator>
  );
}
