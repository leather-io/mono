import { ActivityList } from '@/components/activity/activity-list';
import { useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useTotalActivityQuery } from '@/queries/activity/account-activity.query';

import { ActivityLayout } from './activity.layout';

export default function ActivityScreen() {
  const accounts = useTotalAccountAddresses();
  const { data: activity } = useTotalActivityQuery(accounts);

  // TODO LEA-1726: Handle loading and error states
  if (!activity) {
    return null;
  }

  return (
    <ActivityLayout>
      <ActivityList activity={activity} />
    </ActivityLayout>
  );
}
