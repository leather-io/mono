import { ActivityListItem } from '@/components/activity/activity-list-item';

import { Activity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface ActivityListProps {
  activity: Activity[];
}

export function ActivityList({ activity }: ActivityListProps) {
  return (
    <Box>
      {activity.map((activity, index) => (
        <ActivityListItem key={`activity.${index}`} activity={activity} />
      ))}
    </Box>
  );
}
