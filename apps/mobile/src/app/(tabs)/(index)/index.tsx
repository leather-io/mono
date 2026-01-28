import { HomeScreenWithAccount } from '@/components/home/home-with-account-screen';
import { HomeScreenWithoutAccount } from '@/components/home/home-without-account-screen';
import { CurrentAccountLoader } from '@/store/settings/settings';

export default function HomeScreen() {
  return (
    <CurrentAccountLoader fallback={<HomeScreenWithoutAccount />}>
      {currentAccount => <HomeScreenWithAccount currentAccount={currentAccount} />}
    </CurrentAccountLoader>
  );
}
