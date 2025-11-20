import { ReactNode, useCallback } from 'react';

import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
import { translateActivityStatus } from '@/features/activity/translate-activity-status';
import { RefreshControl } from '@/features/refresh-control/refresh-control';

import { type ActivityView } from '@leather.io/features';

import { ActivityEmpty } from './activity-empty';
import { ActivityItem } from './activity-item';
import { ActivityLoading } from './activity-loading';

interface ActivityListProps {
  data: FetchState<ActivityView[]>;
  header: ReactNode;
}

export function ActivityList({ data, header }: ActivityListProps) {
  const renderItem = useCallback(
    ({ item }: { item: ActivityView }) => <ActivityItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: ActivityView) => item.key, []);

  if (data.state === 'loading') {
    return <ActivityLoading />;
  }

  if (data.state === 'error') {
    return <ActivityEmpty />;
  }

  const translatedActivity = data.value.map(item => {
    return {
      ...item,
      statusLabel: translateActivityStatus(item.statusLabel) as string,
    };
  });

  return (
    <Screen.FlashList
      data={translatedActivity}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={<>{header}</>}
      ListEmptyComponent={<ActivityEmpty />}
    />
  );
}
