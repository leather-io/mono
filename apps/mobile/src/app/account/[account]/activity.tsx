import { ActivityLayout } from '@/app/activity/activity.layout';
import { ActivityList } from '@/components/activity/activity-list';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAccountActivityQuery } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';

import { configureAccountParamsSchema } from './index';

export default function AccountActivityScreen() {
  const params = useLocalSearchParams();
  const { accountId, accountName } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const accountAddresses = useAccountAddresses(fingerprint, accountIndex);
  const { data: activity } = useAccountActivityQuery(accountAddresses);

  // TODO LEA-1726: Handle loading and error states
  if (!activity) {
    return null;
  }

  return (
    <ActivityLayout accountName={accountName}>
      <ActivityList activity={activity} />
    </ActivityLayout>
  );
}
