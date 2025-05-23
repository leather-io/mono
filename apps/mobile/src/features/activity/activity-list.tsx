import { useState } from 'react';

import { useRefreshHandler } from '@/components/page/page.layout';
import { ViewMode } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityEmpty } from './activity-empty';
import { ActivityListItem } from './activity-list-item';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
  const { refreshing, onRefresh } = useRefreshHandler();
  const [renderLimit, setRenderLimit] = useState(10);
  const filteredActivities = activity
    .slice(0, renderLimit)
    .filter(activity => activity.type in OnChainActivityTypes) as OnChainActivity[];

  if (mode === 'widget') {
    return (
      <Box flexDirection="row" gap="3">
        {filteredActivities.map((activity, index) => (
          <ActivityCard key={`activity.${index}`} activity={activity} />
        ))}
      </Box>
    );
  }

  return (
    <Box flex={1} width="100%" height="100%">
      <FlashList
        data={filteredActivities}
        renderItem={({ item }: { item: OnChainActivity }) => <ActivityListItem activity={item} />}
        estimatedItemSize={72}
        keyExtractor={(_, index) => `activity.${index}`}
        showsVerticalScrollIndicator={false}
        onEndReached={() => setRenderLimit(renderLimit + 10)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<ActivityEmpty />}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </Box>
  );
}
