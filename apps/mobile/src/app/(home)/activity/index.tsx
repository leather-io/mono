import { useAccountTotalBalance } from '@/queries/balance/total-balance.query';
import { AccountLoader, deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import { ActivityLayout } from './activity.layout';

export default function ActivityScreen() {
  //   const params = useLocalSearchParams();
  //   const { accountId } = configureAccountParamsSchema.parse(params);
  //   const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  //   const { totalBalance } = useAccountTotalBalance({ fingerprint, accountIndex });

  return (
    // <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
    <ActivityLayout />
    // </AccountLoader>
  );
}
