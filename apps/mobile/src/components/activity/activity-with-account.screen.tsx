import { Screen } from '@/components/screen/screen';
import { ActivityList } from '@/features/activity/activity-list';
import { useActivity } from '@/queries/activity/activity.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';

interface ActivityScreenWithAccountProps {
  currentAccount: AccountId;
}
export default function ActivityScreenWithAccount({
  currentAccount,
}: ActivityScreenWithAccountProps) {
  const activity = useActivity(currentAccount.fingerprint, currentAccount.accountIndex);

  return (
    <Screen>
      <Screen.Header leftElement={null} />
      <ActivityList data={activity} header={<Screen.Title>{t`All activity`}</Screen.Title>} />
    </Screen>
  );
}
