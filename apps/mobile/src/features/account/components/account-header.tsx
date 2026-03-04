import { useEffect } from 'react';

import { AccountAvatar } from '@/features/account/components/account-avatar';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWalletByFingerprint, useWallets } from '@/store/wallets/wallets.read';
import { captureMessage } from '@sentry/react-native';
import { once } from 'remeda';

import { AccountId } from '@leather.io/models';
import { Box, Pressable, Text } from '@leather.io/ui/native';

const triggerAccountDataWarning = once(() => {
  captureMessage('AccountHeader was unable to pull account data from store', {
    level: 'warning',
  });
  // eslint-disable-next-line no-console
  console.warn('AccountHeader was unable to pull account data from store');
});

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

  useEffect(() => {
    if (!accountData) {
      triggerAccountDataWarning();
    }
  }, [accountData]);

  return (
    <Pressable
      onPress={onPress}
      disabled={hasOneAccount}
      flexDirection="row"
      alignItems="center"
      gap="3"
    >
      <AccountAvatar size="lg" icon={accountData?.icon ?? 'home'} />
      <Box>
        <Text variant="label01">{accountData?.name}</Text>
        {!hasOneWallet && wallet && (
          <Text variant="label02" color="ink.text-subdued-secondary">
            {wallet.name}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}
