import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { initiateI18n } from '@/i18n';
import { queryClient } from '@/queries/query';
import { usePersistedStore, useProtectedStore } from '@/state';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { Box, ThemeProvider, useLoadFonts } from '@leather.io/ui/native';

void SplashScreen.preventAutoHideAsync();

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initiateI18n();

export default function RootLayout() {
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
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SplashScreenGuard>
              <AppRouter />
            </SplashScreenGuard>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </I18nProvider>
  );
}

function AppRouter() {
  return (
    <Box backgroundColor="dark.ink.background-secondary" flex={1}>
      <StatusBar barStyle="light-content" />
      <Slot />
    </Box>
  );
}
