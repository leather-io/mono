import { useAccountTotalBalance } from '@/queries/balance/total-balance.query';
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
  console.log('AccountScreen rendered', params, totalBalance);
  // is there something else that is causing the re-render? the loader maybe???
  // maybe need to wait before rendering the layout?
  if (!totalBalance) return null;
  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout account={account} balance={totalBalance} />}
    </AccountLoader>
  );
}
