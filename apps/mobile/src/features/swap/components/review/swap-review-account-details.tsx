import { AccountAvatar } from '@/features/account/components/account-avatar';
import { useCurrentAccount } from '@/hooks/use-current-account';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useWalletByFingerprint, useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';

import { Box, Text, WalletIcon } from '@leather.io/ui/native';
import { assertExistence } from '@leather.io/utils';

export function SwapReviewAccountDetails() {
  const { accountIndex, fingerprint } = useCurrentAccount();
  const account = useAccountByIndex(fingerprint, accountIndex);
  const wallet = useWalletByFingerprint(fingerprint);
  const { list: wallets } = useWallets();
  const hasMoreThanOneWallet = wallets.length > 1;

  assertExistence(wallet, 'wallet');
  assertExistence(account, 'account');

  return (
    <Box flexDirection="row" alignItems="flex-end" justifyContent="space-between" pb="2">
      <Text variant="label02" color="ink.text-subdued">
        {t`From`}
      </Text>

      <Box gap="1" alignItems="flex-end">
        <Box flexDirection="row" gap="2" alignItems="center">
          <AccountAvatar icon={account.icon} size="sm" />
          <Text variant="label02">{account.name}</Text>
        </Box>
        {hasMoreThanOneWallet && (
          <Box flexDirection="row" alignItems="center" gap="1">
            <WalletIcon variant="small" color="ink.text-subdued" />
            <Text variant="label03" color="ink.text-subdued">
              {wallet.name}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
