import { useMemo } from 'react';

import { AvatarIcon } from '@/components/avatar-icon';
import { AccountListItem } from '@/features/accounts/account-list/account-list-item';
import { AccountAddress } from '@/features/accounts/components/account-address';
import { AccountBalance } from '@/features/accounts/components/account-balance';
import { Account } from '@/store/accounts/accounts';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

function AccountItem({ account }: { account: Account }) {
  const { list: walletsList } = useWallets();

  const walletName = useMemo(
    () => walletsList.find(w => w.fingerprint === account.fingerprint)?.name ?? '',
    [account.fingerprint, walletsList]
  );

  const theme = useTheme<Theme>();
  return (
    <AccountListItem
      key={account.id}
      accountName={account.name}
      address={
        <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      balance={
        <AccountBalance accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
      walletName={walletName}
      py="3"
    />
  );
}

export function ApproverAccountCard({ accounts }: { accounts: Account[] }) {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.account.title',
          message: 'With account',
        })}
      </Text>
      {accounts.map(account => (
        <AccountItem key={account.id} account={account} />
      ))}
    </>
  );
}
