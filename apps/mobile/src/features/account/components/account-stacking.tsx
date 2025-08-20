import { Balance } from '@/components/balance/balance';
import { isStacking } from '@/features/balances/utils';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { Box, LockIcon, Text } from '@leather.io/ui/native';

interface AccountStacking {
  account: Account;
}

export function AccountStacking({ account }: AccountStacking) {
  const stxBalance = useStxAccountBalance(account.fingerprint, account.accountIndex);
  const userIsStacking = stxBalance.state == 'success' && isStacking(stxBalance);

  if (!userIsStacking) return null;
  return (
    <Box px="5" pb="5">
      <Box mb="3" height={1} flex={1} bg="ink.border-default" />
      <Box gap="1">
        <Box flexDirection="row" alignItems="center" gap="1">
          <Text variant="label01">{t`Locked`}</Text>
          <LockIcon variant="small" />
        </Box>

        <Balance balance={stxBalance.value?.quote.lockedBalance} variant="heading05" />
      </Box>
    </Box>
  );
}
