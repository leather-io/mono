import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { AccountLoader, deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { TokenLayout } from './token.layout';

const configureTokenParamsSchema = z.object({
  accountId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureTokenParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const { totalBalance } = useAccountBalance({ fingerprint, accountIndex });
  // TODO LEA-1726: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <TokenLayout account={account} balance={totalBalance.value} />}
    </AccountLoader>
  );
}
