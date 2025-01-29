import { useTokenBalance } from '@/queries/balance/account-balance.query';
import { TokenLoader, deserializeTokenId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { TokenLayout } from './token.layout';

const configureTokenParamsSchema = z.object({
  accountId: z.string(),
});

export default function TokenScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureTokenParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeTokenId(accountId);
  const { totalBalance } = useTokenBalance({ fingerprint, accountIndex });
  // TODO LEA-1726: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <TokenLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <TokenLayout account={account} balance={totalBalance.value} />}
    </TokenLoader>
  );
}
