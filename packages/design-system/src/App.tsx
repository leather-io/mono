import { useLoadFonts } from '@/hooks/useLoadFonts.native';
import { theme } from '@/theme-native';
import { ThemeProvider } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';

import StorybookUIRoot from './.storybook-native';

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
      <StorybookUIRoot />
    </ThemeProvider>
  );
}

export default RootLayout;
