import { useAccountTotalBalance } from '@/queries/balance/use-total-balance';
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
  const { totalBalance } = useAccountTotalBalance({ fingerprint, accountIndex });

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout balance={totalBalance} account={account} />}
    </AccountLoader>
  );
}
