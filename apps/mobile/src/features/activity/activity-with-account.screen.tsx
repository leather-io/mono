import { Screen } from '@/components/screen/screen';
import { ActivityList } from '@/features/activity/activity-list';
import { useActivityFeed } from '@/queries/activity/activity.query';
import { t } from '@lingui/core/macro';

import { type AccountId } from '@leather.io/models';

interface ActivityScreenWithAccountProps {
  currentAccount: AccountId;
}
export default function ActivityScreenWithAccount({
  currentAccount,
}: ActivityScreenWithAccountProps) {
  const { activity, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } = useActivityFeed(
    currentAccount.fingerprint,
    currentAccount.accountIndex
  );

  return (
    <Screen>
      <Screen.Header leftElement={null} />
      <ActivityList
        data={activity}
        header={<Screen.Title>{t`Activity`}</Screen.Title>}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onRetry={refetch}
      />
    </Screen>
  );
}
