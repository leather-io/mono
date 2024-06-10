import { useState } from 'react';
import { StatusBar } from 'react-native';

import { initiateI18n } from '@/i18n';
import { queryClient } from '@/queries/query';
import { usePersistedStore, useProtectedStore } from '@/state';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import LottieView from 'lottie-react-native';

import { Box, ThemeProvider, useLoadFonts } from '@leather-wallet/ui/native';

void SplashScreen.preventAutoHideAsync();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

initiateI18n();

function RootLayout() {
  const hasProtectedStoreHydrated = useProtectedStore(state => state._hasHydrated);
  const hasPersistedStoreHydrated = usePersistedStore(state => state._hasHydrated);

  const { fontsLoaded } = useLoadFonts({
    onLoaded() {
      void SplashScreen.hideAsync();
    },
  });

  if (!fontsLoaded || !hasProtectedStoreHydrated || !hasPersistedStoreHydrated) {
    return null;
  }

  return (
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppWithNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

function AppWithNavigation() {
  const [animationFinished, setAnimationFinished] = useState(false);
  if (!animationFinished) {
    return (
      <Box backgroundColor="base.ink.component-background-default" flex={1}>
        <LottieView
          resizeMode="cover"
          style={{ flex: 1 }}
          speed={1}
          source={require('@/assets/splashScreenLottie.json')}
          onAnimationFailure={() => {
            setAnimationFinished(true);
          }}
          onAnimationFinish={() => {
            setAnimationFinished(true);
          }}
          autoPlay
          loop={false}
        />
      </Box>
    );
  }

  const bg = !animationFinished
    ? 'base.ink.component-background-default'
    : 'dark.ink.background-secondary';

  return (
    <Box backgroundColor={bg} flex={1}>
      <StatusBar barStyle="light-content" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </Box>
  );
}

export default RootLayout;
