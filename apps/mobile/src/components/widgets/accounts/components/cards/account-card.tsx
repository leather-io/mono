import { AvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { useAccountTotalBalance } from '@/queries/balance/total-balance.query';
import { TestId } from '@/shared/test-id';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { AccountStore } from '@/store/accounts/utils';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  account: AccountStore;
  onPress(): void;

  testID?: string;
}
export function AccountCard({ account, onPress }: AccountCardProps) {
  const { i18n } = useLingui();
  const { id: accountId, type } = account;
  const theme = useTheme<Theme>();
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const { totalBalance } = useAccountTotalBalance({ fingerprint, accountIndex });

  return (
    <AccountCardLayout
      icon={
        <AvatarIcon
          color={theme.colors['ink.background-primary']}
          icon={account.icon}
          width={32}
          height={32}
        />
      }
      label={<Balance balance={totalBalance} />}
      caption={i18n._({
        id: 'accounts.account.cell_caption',
        message: '{name}',
        values: { name: account.name || '' },
      })}
      onPress={onPress}
      type={type}
      testID={TestId.homeAccountCard}
    />
  );
}
