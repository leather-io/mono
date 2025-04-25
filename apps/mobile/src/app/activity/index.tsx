import { ActivityListItem } from '@/components/activity/activity-list-item';
import { useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useTotalActivityQuery } from '@/queries/activity/account-activity.query';

import { ActivityLayout } from './activity.layout';

export default function ActivityScreen() {
  const accounts = useTotalAccountAddresses();
  const { data: activity, isLoading } = useTotalActivityQuery(accounts);
  // TODO LEA-1726: Handle loading and error states
  if (isLoading) {
    return null;
  }

  return (
    <ActivityLayout>
      {activity?.map((activity, index) => (
        <ActivityListItem key={`activity.${index}`} activity={activity} />
      ))}
    </ActivityLayout>
  );
}
