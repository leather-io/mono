import { MockedAccount } from '@/mocks/account.mocks';
import { AccountLoader } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout account={account as MockedAccount} />}
    </AccountLoader>
  );
}
