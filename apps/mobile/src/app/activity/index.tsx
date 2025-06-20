import { FetchWrapper } from '@/components/loading/fetch-wrapper';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { ActivityList } from '@/features/activity/activity-list';
import { hasActivity } from '@/features/activity/activity-widget';
import { ActivityLayout } from '@/features/activity/activity.layout';
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
          <Box width="100%" justifyContent="center" alignItems="center">
            <ActivityEmpty />
          </Box>
        )}
      </FetchWrapper>
    </ActivityLayout>
  );
}
