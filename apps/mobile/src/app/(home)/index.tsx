import { SafeAreaView } from 'react-native';

import { AppStartMode, whenAppStartMode } from '@/utils/when-app-start-mode';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '@leather.io/ui/native';

let hasRun = false;

const startRoute = whenAppStartMode(process.env.EXPO_PUBLIC_APP_START_MODE as AppStartMode)({
  live: '/',
  prelaunch: '/waiting-list',
});

export default function Home() {
  const router = useRouter();

  if (process.env.EXPO_PUBLIC_APP_START_MODE && !hasRun) {
    hasRun = true;
    return <Redirect href={startRoute} />;
  }

  return (
    <SafeAreaView>
      <Button
        variant="solid"
        label="Make new wallet"
        onPress={() => {
          // eslint-disable-next-line no-console
          console.log('Make new wallet');
        }}
      />
      <Button
        variant="solid"
        label="Go to start page"
        onPress={() => router.replace('/waiting-list')}
      />
    </SafeAreaView>
  );
}
