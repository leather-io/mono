import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { AppUpdateRequiredSheet } from '@/components/app-update-required';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { StatusBar } from '@/components/status-bar';
import { ToastWrapper } from '@/components/toast/toast-context';
import { VersionGuard } from '@/components/version-guard/version-guard';
import { GlobalSheetProvider } from '@/core/global-sheet-provider';
import { HapticsProvider } from '@/core/haptics-provider';
import { LeatherQueryProvider } from '@/core/leather-query-provider';
import { ThemeProvider } from '@/core/theme-provider';
import { AddAccountSheet } from '@/features/account/sheets/add-account-sheet';
import { featureFlagClient, setupFeatureFlags } from '@/features/feature-flags';
import { useWatchNotificationAddresses } from '@/features/notifications/use-notifications';
import { ReceiveSheet } from '@/features/receive/receive-sheet';
import { SendSheet } from '@/features/send/send-sheet';
import { DescriptionSheet } from '@/features/settings/description-sheet';
import { AddWalletSheet } from '@/features/wallet-manager/add-wallet/add-wallet-sheet';
import { useDeepLinks } from '@/hooks/use-deep-links';
import { usePageViewTracking } from '@/hooks/use-page-view-tracking';
import { I18nProvider } from '@/i18n/i18n';
import { queryClient } from '@/queries/query';
import { initAppServices } from '@/services/init-app-services';
import { persistor, store } from '@/store';
import { useSettings } from '@/store/settings/settings';
import { trackFirstAppOpen } from '@/utils/analytics';
import { LDProvider } from '@launchdarkly/react-native-client-sdk';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';

import { Box, SheetModalProvider } from '@leather.io/ui/native';

dayjs.extend(relativeTime);

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: false,
  tracesSampleRate: 1.0,
  enabled: !__DEV__,
});

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initAppServices();
void SplashScreen.preventAutoHideAsync();
void setupFeatureFlags();
ErrorUtils.setGlobalHandler(error => {
  Sentry.captureException(error);
});

function App() {
  useWatchNotificationAddresses();
  usePageViewTracking();
  const { currentAccount } = useSettings();

  useEffect(() => {
    void trackFirstAppOpen();
  }, []);

  // Handle deep links
  useDeepLinks(router);

  return (
    <Box backgroundColor="ink.background-secondary" flex={1}>
      <ErrorBoundary>
        <VersionGuard />
        <StatusBar />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        {currentAccount && (
          <>
            <SendSheet />
            <ReceiveSheet />
          </>
        )}
        <AddAccountSheet />
        <AddWalletSheet />
        <AppUpdateRequiredSheet />
        <DescriptionSheet />
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
            <I18nProvider>
              <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                  <LeatherQueryProvider>
                    <ThemeProvider>
                      <GestureHandlerRootView style={{ flex: 1 }}>
                        <ToastWrapper>
                          <SplashScreenGuard>
                            <HapticsProvider>
                              <GlobalSheetProvider>
                                <SheetModalProvider>
                                  <App />
                                </SheetModalProvider>
                              </GlobalSheetProvider>
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

export default Sentry.wrap(RootLayout);
