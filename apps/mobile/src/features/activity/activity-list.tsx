import { ReactNode } from 'react';

import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useAccountActivity } from '@/queries/activity/account-activity.query';

import { ActivityEmpty } from './activity-empty';
import { ActivityListItem } from './activity-list-item';

interface ActivityFlashListProps {
  data: ReturnType<typeof useAccountActivity>;
  header: ReactNode;
}

export function ActivityList({ data, header }: ActivityFlashListProps) {
  const activity = data.state === 'success' ? data.value : [];

  return (
    <Screen.FlashList
      data={activity}
      renderItem={({ item }) => <ActivityListItem activity={item} />}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={<>{header}</>}
      ListEmptyComponent={<ActivityEmpty />}
    />
  );
}
