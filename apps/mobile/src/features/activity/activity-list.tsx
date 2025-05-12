import { ViewMode } from '@/shared/types';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { ActivityCard } from './activity-card';
import { ActivityListItem } from './activity-list-item';

interface ActivityListProps {
  activity: Activity[];
  mode?: ViewMode;
}

export function ActivityList({ activity, mode = 'full' }: ActivityListProps) {
  const Component = mode === 'widget' ? ActivityCard : ActivityListItem;
  return (
    <Box flexDirection={mode === 'widget' ? 'row' : 'column'} gap={mode === 'widget' ? '3' : '0'}>
      {activity
        .slice(0, mode === 'widget' ? 5 : undefined)
        .filter(activity => activity.type in OnChainActivityTypes)
        .map((activity, index) => (
          <Component key={`activity.${index}`} activity={activity as OnChainActivity} />
        ))}
    </Box>
  );
}
