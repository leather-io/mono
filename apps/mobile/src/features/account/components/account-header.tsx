import { AccountAvatar } from '@/features/account/components/account-avatar';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWalletByFingerprint, useWallets } from '@/store/wallets/wallets.read';

import { AccountId } from '@leather.io/models';
import { Box, Pressable, Text } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

interface AccountHeaderProps {
  account: AccountId;
  onPress?(): void;
}

export function AccountHeader({ account, onPress }: AccountHeaderProps) {
  const { fingerprint } = account;
  const { list: accounts, fromAccountIndex } = useAccounts();
  const accountData = fromAccountIndex(account.fingerprint, account.accountIndex)[0];
  const { list: wallets } = useWallets();
  const wallet = useWalletByFingerprint(fingerprint);

  const hasOneAccount = accounts.length === 1;
  const hasOneWallet = wallets.length === 1;

  assertExistence(accountData, 'AccountHeader was unable to pull account data from store');

  return (
    <Pressable
      onPress={onPress}
      disabled={hasOneAccount}
      flexDirection="row"
      alignItems="center"
      gap="3"
    >
      <AccountAvatar variant="sm" icon={accountData.icon} />
      <Box>
        <Text variant="label01">{accountData.name}</Text>
        {!hasOneWallet && wallet && (
          <Text variant="label02" color="ink.text-subdued">
            {wallet.name}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
