import { useMemo } from 'react';

import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountBalance } from '@/features/account/components/account-balance';
import { Account } from '@/store/accounts/accounts';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

function AccountItem({ account, onPress }: { account: Account; onPress?: () => void }) {
  const { list: walletsList } = useWallets();

  const walletName = useMemo(
    () => walletsList.find(w => w.fingerprint === account.fingerprint)?.name ?? '',
    [account.fingerprint, walletsList]
  );

  return (
    <AccountListItem
      onPress={onPress}
      key={account.id}
      accountName={account.name}
      address={
        <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      balance={
        <AccountBalance accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      icon={<AccountAvatar icon={account.icon} />}
      walletName={walletName}
      py="3"
    />
  );
}

export function ApproverAccountCard({
  accounts,
  onPress,
}: {
  accounts: Account[];
  onPress?: () => void;
}) {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.account.title',
          message: 'With account',
        })}
      </Text>
      <Box mx="-5">
        {accounts.map(account => (
          <AccountItem onPress={onPress} key={account.id} account={account} />
        ))}
      </Box>
    </>
  );
}
