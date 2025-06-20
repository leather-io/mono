import { configureAccountParamsSchema } from '@/app/account/[accountId]/index';
import { FetchWrapper } from '@/components/loading/fetch-wrapper';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { ActivityList } from '@/features/activity/activity-list';
import { hasActivity } from '@/features/activity/activity-widget';
import { ActivityLayout } from '@/features/activity/activity.layout';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';

export default function AccountActivityScreen() {
  const params = useLocalSearchParams();
  const { accountId, accountName } = configureAccountParamsSchema.parse(params);
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const activity = useAccountActivity(fingerprint, accountIndex);

  return (
    <ActivityLayout accountName={accountName}>
      <FetchWrapper data={activity}>
        {hasActivity(activity) ? (
          activity.state === 'success' && <ActivityList activity={activity.value} />
        ) : (
          <ActivityEmpty />
        )}
      </FetchWrapper>
    </ActivityLayout>
  );
}
