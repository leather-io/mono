import ActivityScreenWithAccount from '@/features/activity/activity-with-account.screen';
import ActivityScreenWithoutAccount from '@/features/activity/activity-without-account-screen';
import { CurrentAccountLoader } from '@/store/settings/settings';

export default function ActivityScreen() {
  return (
    <CurrentAccountLoader fallback={<ActivityScreenWithoutAccount />}>
      {currentAccount => <ActivityScreenWithAccount currentAccount={currentAccount} />}
    </CurrentAccountLoader>
  );
}
