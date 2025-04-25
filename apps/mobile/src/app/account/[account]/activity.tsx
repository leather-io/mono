import { ActivityLayout } from '@/app/activity/activity.layout';
import { ActivityListItem } from '@/components/activity/activity-list-item';
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
  const { data: activity, isLoading } = useAccountActivityQuery(accountAddresses);

  if (isLoading) {
    return null;
  }
  return (
    <ActivityLayout accountName={accountName}>
      {activity?.map((activity, index) => (
        <ActivityListItem key={`activity.${index}`} activity={activity} />
      ))}
    </ActivityLayout>
  );
}
