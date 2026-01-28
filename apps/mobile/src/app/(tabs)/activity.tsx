import ActivityScreenWithAccount from '@/components/activity/activity-with-account.screen';
import ActivityScreenWithoutAccount from '@/components/activity/activity-without-account-screen';
import { CurrentAccountLoader } from '@/store/settings/settings';

export default function ActivityScreen() {
  return (
    <CurrentAccountLoader fallback={<ActivityScreenWithoutAccount />}>
      {currentAccount => <ActivityScreenWithAccount currentAccount={currentAccount} />}
    </CurrentAccountLoader>
  );
}
