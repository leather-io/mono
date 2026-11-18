import { Screen } from '@/components/screen/screen';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { t } from '@lingui/core/macro';

export default function ActivityScreenWithoutAccount() {
  return (
    <Screen>
      <Screen.Header leftElement={null} />
      <Screen.Title>{t`Activity`}</Screen.Title>
      <ActivityEmpty />
    </Screen>
  );
}
