import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { ActionBar } from '@/components/action-bar/action-bar';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { StatusBar } from '@/components/status-bar';
import { ToastWrapper } from '@/components/toast/toast-context';
import { AppNavigationStack } from '@/core/app-navigation-stack';
import { BrowserProvider } from '@/core/browser-provider';
import { GlobalSheetProvider } from '@/core/global-sheet-provider';
import { HapticsProvider } from '@/core/haptics-provider';
import { LeatherQueryProvider } from '@/core/leather-query-provider';
import { QueryPreloader } from '@/core/query-preloader';
import { ThemeProvider } from '@/core/theme-provider';
import { AddAccountSheet } from '@/features/account/sheets/add-account-sheet';
import { BrowserSheet } from '@/features/browser/browser/browser-sheet';
import { featureFlagClient, setupFeatureFlags } from '@/features/feature-flags';
import { useWatchNotificationAddresses } from '@/features/notifications/use-notifications';
import { ReceiveSheet } from '@/features/receive/receive-sheet';
import { SendSheet } from '@/features/send/send-sheet';
import { AddWalletSheet } from '@/features/wallet-manager/add-wallet/add-wallet-sheet';
import { usePageViewTracking } from '@/hooks/use-page-view-tracking';
import { initiateI18n } from '@/locales';
import { queryClient } from '@/queries/query';
import { initAppServices } from '@/services/init-app-services';
import { persistor, store } from '@/store';
import { trackFirstAppOpen } from '@/utils/analytics';
import { LDProvider } from '@launchdarkly/react-native-client-sdk';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';

import { Box, SheetProvider } from '@leather.io/ui/native';

dayjs.extend(relativeTime);

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_NODE_ENV ?? 'development',
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  integrations: [Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initAppServices();
void SplashScreen.preventAutoHideAsync();
void initiateI18n();
void setupFeatureFlags();

function App() {
  useWatchNotificationAddresses();
  usePageViewTracking();

  useEffect(() => {
    void trackFirstAppOpen();
  }, []);

  return (
    <Box backgroundColor="ink.background-secondary" flex={1}>
      <ErrorBoundary>
        <StatusBar />
        <AppNavigationStack />
        <ActionBar />
        <SendSheet />
        <ReceiveSheet />
        <BrowserSheet />
        <AddAccountSheet />
        <AddWalletSheet />
      </ErrorBoundary>
    </Box>
  );
}

function RootLayout() {
  return (
    <KeyboardProvider>
      <LDProvider client={featureFlagClient}>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <I18nProvider i18n={i18n}>
              <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                  <LeatherQueryProvider>
                    <QueryPreloader>
                      <ThemeProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                          <ToastWrapper>
                            <SplashScreenGuard>
                              <HapticsProvider>
                                <GlobalSheetProvider>
                                  <BrowserProvider>
                                    <SheetProvider>
                                      <App />
                                    </SheetProvider>
                                  </BrowserProvider>
                                </GlobalSheetProvider>
                              </HapticsProvider>
                            </SplashScreenGuard>
                          </ToastWrapper>
                        </GestureHandlerRootView>
                      </ThemeProvider>
                    </QueryPreloader>
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

export default Sentry.wrap(RootLayout);
