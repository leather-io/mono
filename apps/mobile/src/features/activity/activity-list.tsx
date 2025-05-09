import { ViewMode } from '@/shared/types';

import { Activity } from '@leather.io/models';
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
    <Box>
      {activity.slice(0, mode === 'widget' ? 5 : undefined).map((activity, index) => (
        <Component key={`activity.${index}`} activity={activity} />
      ))}
    </Box>
  );
}
