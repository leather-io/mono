import { FetchWrapper } from '@/components/loading';
import { ActivityCell, ActivityLayout, hasActivity } from '@/features/activity';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { useTotalActivity } from '@/queries/activity/account-activity.query';

import { Box } from '@leather.io/ui/native';

export default function ActivityScreen() {
  const activity = useTotalActivity();

  return (
    <ActivityLayout>
      <FetchWrapper data={activity}>
        {hasActivity(activity) ? (
          activity.state === 'success' &&
          activity.value?.map((activity, index) => {
            // FIXME LEA-2310: temporary hard cap for widget view pending performance improvements
            if (index >= 5) return null;

            return <ActivityCell key={`activity.${index}`} activity={activity} />;
          })
        ) : (
          <Box px="5">
            <ActivityEmpty />
          </Box>
        )}
      </FetchWrapper>
    </ActivityLayout>
  );
}
