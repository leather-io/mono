import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AccountBalance } from '@/features/balances/total-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountTotalBalance } from '@/queries/balance/account-balance.query';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { Box, Pressable, QuestionCircleIcon, SkeletonLoader, Text } from '@leather.io/ui/native';

interface AccountTotalBalanceProps {
  account: AccountId;
}

export function AccountTotalBalance({ account }: AccountTotalBalanceProps) {
  const { hasWallets } = useWallets();
  const { descriptionSheetRef } = useGlobalSheets();
  const totalBalance = useAccountTotalBalance({
    fingerprint: account.fingerprint,
    accountIndex: account.accountIndex,
  });
  if (!hasWallets) return null;

  return (
    <Box px="5" pb="5" pt="3" gap="1">
      <Box flexDirection="row" justifyContent="space-between">
        <Pressable
          onPress={() => {
            descriptionSheetRef.current?.present({
              title: t`Total balance`,
              data: [
                {
                  key: 'paragraph',
                  text: t`Your total tokens on chain. Includes both available and locked amounts.`,
                },
              ],
            });
          }}
          flexDirection="row"
          gap="1"
          alignItems="center"
        >
          <Text variant="label02">{t`Total balance`}</Text>
          <QuestionCircleIcon variant="small" />
        </Pressable>
        <NetworkBadge />
      </Box>
      <Box>
        <SkeletonLoader height={44} width={200} isLoading={totalBalance.state === 'loading'}>
          <AccountBalance
            fingerprint={account.fingerprint}
            accountIndex={account.accountIndex}
            variant="heading02"
          />
        </SkeletonLoader>
      </Box>
    </Box>
  );
}
