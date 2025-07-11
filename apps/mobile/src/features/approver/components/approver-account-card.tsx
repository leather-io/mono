import { useMemo } from 'react';

import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { AccountBalance } from '@/features/balances/total-balance';
import { Account } from '@/store/accounts/accounts';
import { useWallets } from '@/store/wallets/wallets.read';

import { Box } from '@leather.io/ui/native';

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
        <AccountBalance
          accountIndex={account.accountIndex}
          fingerprint={account.fingerprint}
          variant="label01"
        />
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
    <Box mx="-5">
      {accounts.map(account => (
        <AccountItem onPress={onPress} key={account.id} account={account} />
      ))}
    </Box>
  );
}
