import { ReactNode, useMemo } from 'react';

import { RefreshControl } from '@/features/refresh-control/refresh-control';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { FlashList } from '@shopify/flash-list';

import { ActivityEmpty } from './activity-empty';
import { ActivityListItem } from './activity-list-item';

interface ActivityFlashListProps {
  data: ReturnType<typeof useTotalActivity>;
  header: ReactNode;
}

export function ActivityFlashList({ data, header }: ActivityFlashListProps) {
  const activityData = useMemo(() => {
    if (data.state === 'success') return data.value;
    return [];
  }, [data]);

  return (
    <FlashList
      data={activityData}
      renderItem={({ item }) => <ActivityListItem activity={item} />}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={<>{header}</>}
      ListEmptyComponent={<ActivityEmpty />}
    />
  );
}
