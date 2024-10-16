import { useGetTokensList } from '@/components/widgets/tokens/use-get-tokens-list';
import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { AccountLoader } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  accountIndex: z.string().transform(value => Number(value)),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();

  const { fingerprint, accountIndex } = configureAccountParamsSchema.parse(params);
  const account = useAccountByIndex(fingerprint, accountIndex);

  const { totalBalance } = useTotalBalance(account ? [account] : []);
  const tokens = useGetTokensList(account ? [account] : []);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout balance={totalBalance} account={account} tokens={tokens} />}
    </AccountLoader>
  );
}
