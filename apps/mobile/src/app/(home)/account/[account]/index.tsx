import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { AccountLoader, deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  accountId: z.string(),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout account={account} balance={totalBalance.value} />}
    </AccountLoader>
  );
}
