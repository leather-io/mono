import { useState } from 'react';
import { StatusBar } from 'react-native';

import { LeatherSplash } from '@/components/animations/leather-splash';
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
export const unstable_settings = { initialRouteName: 'waiting-list/index' };

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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppWithNavigation />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

// interface SplashScreenContainerProps {
//   children: React.ReactNode;
// }
// function SplashScreenContainer({ children }: SplashScreenContainerProps) {

// }

function AppWithNavigation() {
  const [animationFinished, setAnimationFinished] = useState(false);

  if (!animationFinished) {
    return (
      <Box backgroundColor="base.ink.component-background-default" flex={1}>
        <LeatherSplash onAnimationEnd={() => setAnimationFinished(true)} />
      </Box>
    );
  }

  const bg = !animationFinished
    ? 'base.ink.component-background-default'
    : 'dark.ink.background-secondary';

  return (
    <Box backgroundColor={bg} flex={1}>
      <StatusBar barStyle="light-content" />
      <Slot initialRouteName="waiting-list/index" />
    </Box>
  );
}
