import { ReactNode, useCallback } from 'react';

import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
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
    return <ActivityLoading header={header} />;
  }

  if (data.state === 'error') {
    return (
      <Screen.List
        data={[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={<>{header}</>}
        ListEmptyComponent={<ActivityEmpty />}
      />
    );
  }

  return (
    <Screen.List
      data={data.value}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={<>{header}</>}
      ListEmptyComponent={<ActivityEmpty />}
    />
  );
}
