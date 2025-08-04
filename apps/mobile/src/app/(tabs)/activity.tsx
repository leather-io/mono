import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityListItem } from '@/features/activity';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { RefreshControl, useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { t } from '@lingui/core/macro';

import { Text } from '@leather.io/ui/native';

export default function ActivityScreen() {
  const activity = useTotalActivity();
  const { refreshing, onRefresh } = useRefreshHandler();
  const pageTitle = t`All Activity`;

  return (
    <Screen>
      <Screen.Header
        leftElement={null}
        centerElement={<Text variant="heading05">{t`All Activity`}</Text>}
      />

      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            refreshControl={<RefreshControl />}
            ListHeaderComponent={<Screen.Title>{pageTitle}</Screen.Title>}
            data={activity.value.filter(activity => activity && 'asset' in activity)}
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
