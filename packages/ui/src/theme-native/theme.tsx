import { ColorSchemeName } from 'react-native';

import { ThemeProvider as ThemeProviderRestyle, createTheme } from '@shopify/restyle';

import { AllThemePalette, colorThemes, getMobileTextVariants } from '@leather.io/tokens';

const textVariants = getMobileTextVariants();

export function generateTheme(colorScheme: ColorSchemeName) {
  return createTheme({
    colors: colorScheme === 'dark' ? colorThemes.dark : colorThemes.base,
    spacing: {
      '0': 0,
      '1': 4,
      '2': 8,
      '3': 12,
      '4': 16,
      '5': 24,
      '6': 32,
      '7': 40,
    },
    borderRadii: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
    },
    textVariants,
    breakpoints: {},
  });
}
// Temporary work for waitlist app
export function _generateAllTheme() {
  const darkTheme = Object.entries(colorThemes.dark).reduce((prevVal, curVal) => {
    return {
      ...prevVal,
      ['dark.' + curVal[0]]: curVal[1],
    };
  }, {});
  const baseTheme = Object.entries(colorThemes.base).reduce((prevVal, curVal) => {
    return {
      ...prevVal,
      ['base.' + curVal[0]]: curVal[1],
    };
  }, {});

  const theme = {
    ...darkTheme,
    ...baseTheme,
  } as AllThemePalette;

  return createTheme({
    colors: theme,
    spacing: {
      '0': 0,
      '1': 4,
      '2': 8,
      '3': 12,
      '4': 16,
      '5': 24,
      '6': 32,
      '7': 40,
    },
    borderRadii: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
    },
    textVariants,
    breakpoints: {},
  });
}
export type Theme = ReturnType<typeof _generateAllTheme>;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // no color scheme for now.
  // const colorScheme = useColorScheme();

  const theme = _generateAllTheme();

  return <ThemeProviderRestyle theme={theme}>{children}</ThemeProviderRestyle>;
}
