import { ReactNode, useCallback, useMemo } from 'react';

import { FetchState } from '@/components/loading/fetch-state';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';

import { type ActivityView } from '@leather.io/features';

import { ActivityDateHeader, getDateGroupKey } from './activity-date-header';
import { ActivityEmpty } from './activity-empty';
import { ActivityItem } from './activity-item';
import { ActivityLoading } from './activity-loading';

interface DateHeaderRow {
  key: string;
  kind: 'date-header';
  timestamp: number;
}

type ActivityListRow = ActivityView | DateHeaderRow;

function isDateHeaderRow(item: ActivityListRow): item is DateHeaderRow {
  return 'kind' in item && item.kind === 'date-header';
}

function insertDateHeaders(items: ActivityView[]): ActivityListRow[] {
  const result: ActivityListRow[] = [];
  let lastDateKey = '';

  for (const item of items) {
    const ts = item.timestamp;
    if (ts) {
      const dateKey = getDateGroupKey(ts);
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        result.push({ key: `date-${dateKey}`, kind: 'date-header', timestamp: ts });
      }
    }
    result.push(item);
  }

  return result;
}

interface ActivityListProps {
  data: FetchState<ActivityView[]>;
  header: ReactNode;
}

export function ActivityList({ data, header }: ActivityListProps) {
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
      ListEmptyComponent={<ActivityEmpty />}
    />
  );
}
