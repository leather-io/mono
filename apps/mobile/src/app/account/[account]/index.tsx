import { Account } from '@/features/account/account';
import { EmptyBalance } from '@/features/balances/token-balance';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { AccountLoader, deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

export const configureAccountParamsSchema = z.object({
  accountId: z.string(),
  accountName: z.string().optional(),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const { accountId } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const { totalBalance: aggregateBalance } = useAccountBalance({ fingerprint, accountIndex });
  const isLoadingTotalBalance = aggregateBalance.state === 'loading';
  const isErrorTotalBalance = aggregateBalance.state === 'error';
  const totalBalance = aggregateBalance.state === 'success' ? aggregateBalance.value : EmptyBalance;
  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => (
        <Account
          account={account}
          balance={totalBalance}
          isLoading={isLoadingTotalBalance}
          isError={isErrorTotalBalance}
        />
      )}
    </AccountLoader>
  );
}
