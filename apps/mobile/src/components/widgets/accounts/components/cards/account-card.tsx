import { Balance } from '@/components/balance/balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import { TestId } from '@/shared/test-id';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { AccountStore } from '@/store/accounts/utils';
import { useLingui } from '@lingui/react';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  account: AccountStore;
  onPress(): void;
}

export function AccountCard({ account: { id: accountId, icon, name }, onPress }: AccountCardProps) {
  const { i18n } = useLingui();
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);

  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <AccountCardLayout
      icon={<AccountAvatar icon={icon} />}
      label={<Balance balance={totalBalance.value} />}
      caption={i18n._({
        id: 'accounts.account.cell_caption',
        message: '{name}',
        values: { name: name || '' },
      })}
      onPress={onPress}
      testID={TestId.homeAccountCard}
    />
  );
}
