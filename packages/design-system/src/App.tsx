import { useLoadFonts } from '@/hooks/useLoadFonts';
import { theme } from '@/theme';
import { ThemeProvider } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';

import StorybookUIRoot from './.storybook';

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
