import { useColorScheme } from 'react-native';

import { ThemeProvider } from '@shopify/restyle';
import * as SplashScreen from 'expo-splash-screen';

import StorybookUIRoot from './.storybook-native';
import { useLoadFonts } from './hooks/use-load-fonts.native';
import { generateTheme } from './theme-native';

function RootLayout() {
  const colorScheme = useColorScheme();
  const { fontsLoaded } = useLoadFonts({
    onLoaded() {
      void SplashScreen.hideAsync();
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider theme={generateTheme(colorScheme)}>
      <StorybookUIRoot />
    </ThemeProvider>
  );
}

export default RootLayout;
