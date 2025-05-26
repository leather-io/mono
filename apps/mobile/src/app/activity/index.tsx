import { FetchWrapper } from '@/components/loading';
import { ActivityLayout, ActivityList, hasActivity } from '@/features/activity';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { useTotalActivity } from '@/queries/activity/account-activity.query';

import { Box } from '@leather.io/ui/native';

export default function ActivityScreen() {
  const activity = useTotalActivity();

  return (
    <ActivityLayout>
      <FetchWrapper data={activity}>
        {hasActivity(activity) ? (
          activity.state === 'success' && <ActivityList activity={activity.value} />
        ) : (
          <Box width="100%" height={200} justifyContent="center" alignItems="center">
            <ActivityEmpty />
          </Box>
        )}
      </FetchWrapper>
    </ActivityLayout>
  );
}
