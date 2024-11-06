import { useColorScheme } from 'react-native';

import { ThemeProvider } from '@shopify/restyle';
import { useFonts } from 'expo-font';

import StorybookUIRoot from './.storybook-native';
import { generateTheme } from './theme-native';

function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'FiraCode-Retina': require('./assets-native/fonts/FiraCode-Retina.otf'),
    'FiraCode-Medium': require('./assets-native/fonts/FiraCode-Medium.otf'),
    'ABCDiatype-Light': require('./assets-native/fonts/ABCDiatype-Light.otf'),
    'ABCDiatype-Regular': require('./assets-native/fonts/ABCDiatype-Regular.otf'),
    'ABCDiatype-Medium': require('./assets-native/fonts/ABCDiatype-Medium.otf'),
    'MarchePro-Super': require('./assets-native/fonts/MarchePro-Super.otf'),
  });

  if (!loaded || error) {
    return null;
  }

  return (
    <ThemeProvider theme={generateTheme(colorScheme)}>
      <StorybookUIRoot />
    </ThemeProvider>
  );
}

export default RootLayout;
