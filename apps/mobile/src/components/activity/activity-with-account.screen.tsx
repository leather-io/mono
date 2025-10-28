import { Screen } from '@/components/screen/screen';
import { ActivityList } from '@/features/activity/activity-list';
import { useAccountActivity } from '@/queries/activity/account-activity.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { Text } from '@leather.io/ui/native';

interface ActivityScreenWithAccountProps {
  currentAccount: AccountId;
}
export default function ActivityScreenWithAccount({
  currentAccount,
}: ActivityScreenWithAccountProps) {
  const activity = useAccountActivity(currentAccount.fingerprint, currentAccount.accountIndex);
  const pageTitle = t`Activity Page`;

  return (
    <Screen>
      <Screen.Header
        leftElement={null}
        centerElement={<Text variant="heading05">{t`Activity`}</Text>}
      />
      <ActivityList data={activity} header={<Screen.Title>{pageTitle}</Screen.Title>} />
    </Screen>
  );
}
