import { ReactNode, useCallback, useMemo } from 'react';

import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';

import {
  type ActivityView,
  type DateHeaderRow,
  insertDateHeaders,
  isDateHeaderRow,
} from '@leather.io/features';

import { ActivityDateHeader } from './activity-date-header';
import { ActivityEmpty } from './activity-empty';
import { ActivityItem } from './activity-item';
import { ActivityLoading } from './activity-loading';

type ActivityListRow = ActivityView | DateHeaderRow;

interface ActivityListProps {
  data: FetchState<ActivityView[]>;
  isFetching?: boolean;
  header: ReactNode;
}

export function ActivityList({ data, isFetching, header }: ActivityListProps) {
  const rows = useMemo(
    () => (data.state === 'success' ? insertDateHeaders(data.value) : []),
    [data]
  );

  const renderItem = useCallback(({ item }: { item: ActivityListRow }) => {
    if (isDateHeaderRow(item)) {
      return <ActivityDateHeader timestamp={item.timestamp} />;
    }
    return <ActivityItem item={item} />;
  }, []);

  const keyExtractor = useCallback((item: ActivityListRow) => item.key, []);

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
      data={rows}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      refreshControl={<RefreshControl />}
      ListHeaderComponent={<>{header}</>}
      ListEmptyComponent={!isFetching ? <ActivityEmpty /> : undefined}
    />
  );
}
