import { getAvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { useTotalBalance } from '@/features/accounts/balances/hooks/use-total-balance';
import { AccountStore } from '@/store/accounts/utils';
import { useLingui } from '@lingui/react';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  account: AccountStore;
  onPress(): void;
  testID?: string;
}

export function AccountCard({ account, onPress, testID }: AccountCardProps) {
  const { i18n } = useLingui();
  const { type, icon } = account;

  // TODO - fix this as it will always fetch for multiple accounts after keychain refactor
  const { totalBalance } = useTotalBalance();
  return (
    <AccountCardLayout
      Icon={getAvatarIcon(icon)}
      label={<Balance balance={totalBalance} />}
      caption={i18n._({
        id: 'accounts.account.cell_caption',
        message: '{name}',
        values: { name: account.name || '' },
      })}
      onPress={onPress}
      type={type}
      testID={testID}
    />
  );
}
