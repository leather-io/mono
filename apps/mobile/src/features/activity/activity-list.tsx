import { ViewMode } from '@/shared/types';
import { FlashList } from '@shopify/flash-list';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityListItem } from './activity-list-item';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
  const filteredActivities = activity
    .slice(0, mode === 'widget' ? 10 : undefined)
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
    <FlashList
      data={filteredActivities}
      renderItem={({ item }: { item: OnChainActivity }) => <ActivityListItem activity={item} />}
    />
  );
}
