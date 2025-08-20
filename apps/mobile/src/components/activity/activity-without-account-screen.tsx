import { Screen } from '@/components/screen/screen';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { t } from '@lingui/core/macro';

import { Text } from '@leather.io/ui/native';

export default function ActivityScreenWithoutAccount() {
  return (
    <Screen>
      <Screen.Header
        leftElement={null}
        centerElement={<Text variant="heading05">{t`Activity`}</Text>}
      />
      <ActivityEmpty />
    </Screen>
  );
}
