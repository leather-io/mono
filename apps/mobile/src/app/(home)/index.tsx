import { AppStartMode, whenAppStartMode } from '@/utils/when-app-start-mode';
import { Redirect } from 'expo-router';

export default function Home() {
  return whenAppStartMode(process.env.EXPO_PUBLIC_APP_START_MODE as AppStartMode)({
    live: <Redirect href="/send" />,
    prelaunch: <Redirect href="/waiting-list" />,
  });
}
