import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { LeatherQueryProvider } from '@/common/leather-query-provider';
import SheetNavigatorWrapper from '@/common/sheet-navigator/sheet-navigator-wrapper';
import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { ToastWrapper } from '@/components/toast/toast-context';
import { featureFlagClient } from '@/features/feature-flags/feature-flag';
import { setupFeatureFlags } from '@/features/feature-flags/setup-feature-flags';
import { ReceiveSheet } from '@/features/receive/receive-sheet';
import { SendSheet } from '@/features/send/send-sheet';
import { initiateI18n } from '@/locales';
import { queryClient } from '@/queries/query';
import { initAppServices } from '@/services/init-app-services';
import { persistor, store } from '@/store';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { LDProvider } from '@launchdarkly/react-native-client-sdk';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot, useGlobalSearchParams, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';

import {
  Box,
  HasChildren,
  HapticsProvider as LeatherHapticsProvider,
  ThemeProvider as LeatherThemeProvider,
  SheetProvider,
} from '@leather.io/ui/native';

void SplashScreen.preventAutoHideAsync();

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initAppServices();
void initiateI18n();
void setupFeatureFlags();

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    void analytics?.screen(pathname, {
      params,
    });
  }, [pathname, params]);

  return (
    <KeyboardProvider>
      <LDProvider client={featureFlagClient}>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <I18nProvider i18n={i18n}>
              <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                  <LeatherQueryProvider>
                    <ThemeProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <ToastWrapper>
                          <SplashScreenGuard>
                            <HapticsProvider>
                              <SheetNavigatorWrapper>
                                <SheetProvider>
                                  <AppRouter />
                                  <SendSheet />
                                  <ReceiveSheet />
                                </SheetProvider>
                              </SheetNavigatorWrapper>
                            </HapticsProvider>
                          </SplashScreenGuard>
                        </ToastWrapper>
                      </GestureHandlerRootView>
                    </ThemeProvider>
                  </LeatherQueryProvider>
                </QueryClientProvider>
              </SafeAreaProvider>
            </I18nProvider>
          </PersistGate>
        </ReduxProvider>
      </LDProvider>
    </KeyboardProvider>
  );
}

function HapticsProvider({ children }: HasChildren) {
  const { hapticsPreference } = useSettings();

  return (
    <LeatherHapticsProvider enabled={hapticsPreference === 'enabled'}>
      {children}
    </LeatherHapticsProvider>
  );
}

function ThemeProvider({ children }: HasChildren) {
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <LeatherThemeProvider theme={themeDerivedFromThemePreference}>{children}</LeatherThemeProvider>
  );
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
