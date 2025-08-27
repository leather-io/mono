import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AccountBalance } from '@/features/balances/total-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';

import {
  Box,
  Pressable,
  QuestionCircleIcon,
  SkeletonLoader,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface AccountTotalBalanceProps {
  account: Account;
}

export function AccountTotalBalance({ account }: AccountTotalBalanceProps) {
  const { hasWallets } = useWallets();
  const { descriptionSheetRef } = useGlobalSheets();
  const { totalBalance } = useAccountBalance({
    fingerprint: account.fingerprint,
    accountIndex: account.accountIndex,
  });
  const isLoadingTotalBalance = totalBalance.state === 'loading';

  if (!hasWallets) return null;

  return (
    <Box px="5" pb="5" pt="3">
      <Box flexDirection="row" justifyContent="space-between">
        <Pressable
          pressEffects={legacyTouchablePressEffect}
          onPress={() => {
            descriptionSheetRef.current?.present({
              title: t`Total balance`,
              description: t`Your total tokens on chain. Includes both available and locked amounts.`,
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
        {isLoadingTotalBalance ? (
          <SkeletonLoader height={44} width={132} isLoading={true} />
        ) : (
          <AccountBalance
            fingerprint={account.fingerprint}
            accountIndex={account.accountIndex}
            variant="heading03"
          />
        )}
      </Box>
    </Box>
  );
}
