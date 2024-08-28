import { APP_ROUTES } from '@/routes';
import { AppStartMode, whenAppStartMode } from '@/utils/when-app-start-mode';
import { Redirect } from 'expo-router';

export default function Home() {
  if (!process.env.EXPO_PUBLIC_SECRET_KEY) {
    throw new Error('You need to set EXPO_PUBLIC_SECRET_KEY');
  }
  return whenAppStartMode(process.env.EXPO_PUBLIC_APP_START_MODE as AppStartMode)({
    live: <Redirect href={APP_ROUTES.WalletHome} />,
    prelaunch: <Redirect href={APP_ROUTES.WaitingList} />,
  });
}
