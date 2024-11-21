import { AvatarIcon } from '@/components/avatar-icon';
import { AccountListItem } from '@/features/accounts/account-list/account-list-item';
import { AccountAddress } from '@/features/accounts/components/account-address';
import { AccountBalance } from '@/features/accounts/components/account-balance';
import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Text, Theme } from '@leather.io/ui/native';

export function ApproverAccountCard() {
  const theme = useTheme<Theme>();
  const { list: walletsList } = useWallets();
  const wallet = walletsList[0];

  if (!wallet) throw new Error('no wallet present in approver');

  const { list: accountList } = useAccountsByFingerprint(wallet.fingerprint);
  const account = accountList[0];

  if (!account) throw new Error('no account present in approver');

  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.account.title',
          message: 'With account',
        })}
      </Text>
      <AccountListItem
        accountName={account.name}
        address={
          <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
        }
        balance={
          <AccountBalance accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
        }
        icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
        walletName={wallet.name}
      />
    </>
  );
}
