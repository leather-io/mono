import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { SplashScreenGuard } from '@/components/splash-screen-guard/splash-screen-guard';
import { ToastWrapper } from '@/components/toast/toast-context';
import { initiateI18n } from '@/locales';
import { queryClient } from '@/queries/query';
import { persistor, store } from '@/store';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';

import { SheetProvider } from '@leather.io/ui/native';

import { AppRouter } from '../common/app-router';
import { LeatherQueryProvider } from '../common/leather-query-provider';
import { LeatherThemeProvider } from '../common/theme-provider';

void SplashScreen.preventAutoHideAsync();

// Catch any errors thrown by the Layout component
export { ErrorBoundary } from 'expo-router';

// Ensure that reloading on `/modal` keeps a back button present
export const unstable_settings = { initialRouteName: '/' };

initiateI18n();

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nProvider i18n={i18n}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <LeatherQueryProvider>
                <LeatherThemeProvider>
                  <SplashScreenGuard>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <SheetProvider>
                        <ToastWrapper>
                          <AppRouter />
                        </ToastWrapper>
                      </SheetProvider>
                    </GestureHandlerRootView>
                  </SplashScreenGuard>
                </LeatherThemeProvider>
              </LeatherQueryProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </I18nProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
