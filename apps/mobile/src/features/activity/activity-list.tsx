import { type ReactNode, useCallback } from 'react';

import { type FetchState } from '@/components/loading/fetch-state';
import { LoadingItem } from '@/components/loading/loading-item';
import { Screen } from '@/components/screen/screen';
import { RefreshControl } from '@/features/refresh-control/refresh-control';

import { type BlockchainActivityItem } from '@leather.io/features';

import { ActivityEmpty } from './activity-empty';
import { ActivityError } from './activity-error';
import { ActivityItem } from './activity-item';
import { ActivityLoading } from './activity-loading';

interface ActivityListProps {
  data: FetchState<BlockchainActivityItem[]>;
  header: ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?(): void;
  onRetry(): void;
}

export function ActivityList({
  data,
  header,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onRetry,
}: ActivityListProps) {
  const renderItem = useCallback(
    ({ item }: { item: BlockchainActivityItem }) => <ActivityItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: BlockchainActivityItem) => item.view.key, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) onLoadMore?.();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (data.state === 'loading') {
    return <ActivityLoading header={header} />;
  }

  if (data.state === 'error') {
    return (
      <Screen.List
        data={[]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={<RefreshControl />}
        ListHeaderComponent={<>{header}</>}
        ListEmptyComponent={<ActivityError onRetry={onRetry} />}
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
      ListFooterComponent={isFetchingNextPage ? <LoadingItem /> : undefined}
      onEndReached={handleEndReached}
    />
  );
}
