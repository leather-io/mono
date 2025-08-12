import { Screen } from '@/components/screen/screen';
import { ActivityFlashList } from '@/features/activity/activity-flashlist';
import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { t } from '@lingui/core/macro';

import { Text } from '@leather.io/ui/native';

export default function ActivityScreen() {
  const activity = useTotalActivity();
  const pageTitle = t`All Activity`;

  return (
    <Screen>
      <Screen.Header
        leftElement={null}
        centerElement={<Text variant="heading05">{t`All Activity`}</Text>}
      />
      <ActivityFlashList data={activity} header={<Screen.Title>{pageTitle}</Screen.Title>} />
    </Screen>
  );
}
