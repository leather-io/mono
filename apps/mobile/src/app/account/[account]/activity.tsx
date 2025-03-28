import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { useAccountActivityQuery } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';

import { ActivityLayout } from '../../activity/activity.layout';
import { ActivityCell } from '../../activity/components/activity-cell';
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
        <ActivityCell key={`activity.${index}`} activity={activity} />
      ))}
    </ActivityLayout>
  );
}
