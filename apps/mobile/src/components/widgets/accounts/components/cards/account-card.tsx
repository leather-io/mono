import { getAvatarIcon } from '@/components/avatar-icon';
import { Balance } from '@/components/balance/balance';
import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { MockedAccount } from '@/mocks/account.mocks';
import { useLingui } from '@lingui/react';

import { AccountCardLayout } from './account-card.layout';

export interface AccountCardProps {
  account: MockedAccount;
  onPress(): void;
  testID?: string;
}

export function AccountCard({ account, onPress, testID }: AccountCardProps) {
  // TODO - ask Edgar about when we need this
  const { i18n } = useLingui();
  const { type, icon } = account;

  const totalBalance = useTotalBalance([account]);
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
