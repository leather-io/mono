import { configureAccountParamsSchema } from '@/app/account/[account]/index';
import { FetchWrapper } from '@/components/loading';
import { ActivityEmpty, ActivityLayout, ActivityList, hasActivity } from '@/features/activity';
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
