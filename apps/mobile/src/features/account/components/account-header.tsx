import { AccountAvatar } from '@/features/account/components/account-avatar';
import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWalletByFingerprint, useWallets } from '@/store/wallets/wallets.read';

import { Box, Pressable, Text } from '@leather.io/ui/native';

interface AccountHeaderProps {
  account: Account;
  onPress?(): void;
}

export function AccountHeader({ account, onPress }: AccountHeaderProps) {
  const { icon, name, fingerprint } = account;
  const { list: accounts } = useAccounts();
  const { list: wallets } = useWallets();
  const wallet = useWalletByFingerprint(fingerprint);

  const hasOneAccount = accounts.length === 1;
  const hasOneWallet = wallets.length === 1;
  return (
    <Pressable
      onPress={onPress}
      disabled={hasOneAccount}
      flexDirection="row"
      alignItems="center"
      gap="3"
    >
      <AccountAvatar variant="sm" icon={icon} />
      <Box>
        <Text variant="label01">{name}</Text>
        {!hasOneWallet && wallet && (
          <Text variant="label02" color="ink.text-subdued">
            {wallet.name}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
