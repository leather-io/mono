import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { t } from '@lingui/macro';

import { OnChainActivity } from '@leather.io/models';

export default function ActivityScreen() {
  const activity = useTotalActivity();
  const { refreshing, onRefresh } = useRefreshHandler();

  return (
    <Screen>
      <Screen.Header />
      {/*TODO: Add to header centerElement when animation is added*/}
      {/*t({
        id: 'activity.header_title',
        message: 'All activity',
      })*/}
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl />}
            ListHeaderComponent={
              <Screen.Title>
                {t({
                  id: 'activity.header_title',
                  message: 'All activity',
                })}
              </Screen.Title>
            }
            data={activity.value as OnChainActivity[]} // TODO: Unclear why was this cast. Needs clearing up.
            renderItem={({ item }: { item: OnChainActivity }) => (
              <ActivityListItem activity={item} />
            )}
            keyExtractor={(_, index) => `activity.${index}`}
            ListEmptyComponent={<ActivityEmpty />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </FetchWrapper>
    </Screen>
  );
}
