import { Screen } from '@/components/screen/screen';
import { ActivityEmpty } from '@/features/activity/activity-empty';
import { ActivitySelectors } from '@/shared/selectors/activity.selectors';
import { t } from '@lingui/core/macro';

export default function ActivityScreenWithoutAccount() {
  return (
    <Screen testID={ActivitySelectors.ActivityScreen}>
      <Screen.Header leftElement={null} />
      <Screen.Title>{t`Activity`}</Screen.Title>
      <ActivityEmpty />
    </Screen>
  );
}
