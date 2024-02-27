import { useLoadFonts } from '@/hooks/useLoadFonts';
import { theme } from '@/theme';
import { ThemeProvider } from '@shopify/restyle';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import StorybookUIRoot from '../.storybook';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

const storybookEnabled = Constants?.expoConfig?.extra?.storybookEnabled === 'true';

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
    <ThemeProvider theme={theme}>
      {storybookEnabled ? <StorybookUIRoot /> : <AppWithNavigation />}
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
