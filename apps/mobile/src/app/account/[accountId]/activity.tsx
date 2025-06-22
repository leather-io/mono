import { configureAccountParamsSchema } from '@/app/account/[accountId]/index';
import { FetchWrapper } from '@/components/loading';
import { Screen } from '@/components/screen/screen';
import { ActivityEmpty, ActivityListItem } from '@/features/activity';
import { useRefreshHandler } from '@/features/refresh-control/refresh-control';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { i18n } from '@lingui/core';
import { useLocalSearchParams } from 'expo-router';

import { OnChainActivity } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

export default function AccountActivityScreen() {
  const params = useLocalSearchParams();
  const { accountId, accountName } = configureAccountParamsSchema.parse(params);
  const { refreshing, onRefresh } = useRefreshHandler();
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const activity = useAccountActivity(fingerprint, accountIndex);

  return (
    <Screen>
      <Screen.Header
        centerElement={
          <Text variant="label01">
            {i18n._({
              id: 'activity.account.header_title',
              message: '{accountName}',
              values: { accountName: accountName },
            })}
          </Text>
        }
      />
      <FetchWrapper data={activity}>
        {activity.state === 'success' && (
          <Screen.List
            ListHeaderComponent={
              <Screen.Title>
                {i18n._({
                  id: 'activity.account.header_content_title',
                  message: '{accountName} Activity',
                  values: { accountName: accountName },
                })}
              </Screen.Title>
            }
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
