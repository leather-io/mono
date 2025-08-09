import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityEmpty, ActivityListItem } from '@/features/activity';
import { useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';
import { useLocalSearchParams } from 'expo-router';

import { Text } from '@leather.io/ui/native';

import { configureAccountParamsSchema } from './';

export default function AccountActivityScreen() {
  const params = useLocalSearchParams();
  const { accountId, accountName = '' } = configureAccountParamsSchema.parse(params);
  const { refreshing, onRefresh } = useRefreshHandler();
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const activity = useAccountActivity(fingerprint, accountIndex);

  return (
    <Screen>
      <Screen.Header centerElement={<Text variant="label01">{accountName}</Text>} />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            ListHeaderComponent={<Screen.Title>{t`${accountName} Activity`}</Screen.Title>}
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
