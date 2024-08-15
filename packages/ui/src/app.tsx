import { useColorScheme } from 'react-native';

import { ThemeProvider } from '@shopify/restyle';

import StorybookUIRoot from './.storybook-native';
import { generateTheme } from './theme-native';

function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider theme={generateTheme(colorScheme)}>
      <StorybookUIRoot />
    </ThemeProvider>
  );
}

export default RootLayout;
