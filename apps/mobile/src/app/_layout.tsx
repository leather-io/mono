import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { ToastWrapper } from '@/components/toast/toast-context';
import { initiateI18n } from '@/locales';
import { queryClient } from '@/queries/query';
import { persistor, store } from '@/store';
import { useSettings } from '@/store/settings/settings.write';
import { HasChildren } from '@/utils/types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';

import { Box, ThemeProvider as LeatherThemeProvider } from '@leather.io/ui/native';

void SplashScreen.preventAutoHideAsync();

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initiateI18n();

export default function RootLayout() {
  void SplashScreen.hideAsync();

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nProvider i18n={i18n}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <SplashScreenGuard>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <BottomSheetModalProvider>
                      <ToastWrapper>
                        <AppRouter />
                      </ToastWrapper>
                    </BottomSheetModalProvider>
                  </GestureHandlerRootView>
                </SplashScreenGuard>
              </ThemeProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </I18nProvider>
      </PersistGate>
    </ReduxProvider>
  );
}

function ThemeProvider({ children }: HasChildren) {
  const { theme } = useSettings();
  return <LeatherThemeProvider theme={theme}>{children}</LeatherThemeProvider>;
}

function AppRouter() {
  const { whenTheme } = useSettings();

  return (
    <Box backgroundColor="ink.background-secondary" flex={1}>
      <StatusBar barStyle={whenTheme({ dark: 'light-content', light: 'dark-content' } as const)} />
      <Slot />
    </Box>
  );
}
