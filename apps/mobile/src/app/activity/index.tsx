import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { t } from '@lingui/macro';

import { OnChainActivity } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

export default function ActivityScreen() {
  const activity = useTotalActivity();
  const { refreshing, onRefresh } = useRefreshHandler();
  const pageTitle = t({ id: 'activity.header_title', message: 'All activity' });

  return (
    <Screen enableHeaderScrollAnimation>
      <Screen.Header centerElement={<Text variant="label01">{pageTitle}</Text>} />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl />}
            ListHeaderComponent={<Screen.Title>{pageTitle}</Screen.Title>}
            data={activity.value as OnChainActivity[]} // TODO: Unclear why was this cast. Needs clearing up.
            renderItem={({ item }) => <ActivityListItem activity={item} />}
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
