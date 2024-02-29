import { ThemeProvider, useLoadFonts } from '@leather-wallet/design-system/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

function RootLayout() {
  const { fontsLoaded } = useLoadFonts({
    onLoaded() {
      void SplashScreen.hideAsync();
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppWithNavigation />
    </ThemeProvider>
  );
}

function AppWithNavigation() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default RootLayout;
