import { ColorSchemeName } from 'react-native';

import { ThemeProvider as ThemeProviderRestyle, createTheme } from '@shopify/restyle';

import { colorThemes, getMobileTextVariants } from '@leather.io/tokens';

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
      round: 9999,
    },
    textVariants,
    // Temporary workaround for type errors. TODO: Add a zIndex scale.
    zIndices: undefined,
    breakpoints: {},
  });
}

const lightTheme = generateTheme('light');
const darkTheme = generateTheme('dark');

export type Theme = typeof lightTheme & typeof darkTheme;

export type ThemeVariant = 'light' | 'dark';

export function ThemeProvider({
  children,
  theme,
}: {
  theme: ThemeVariant;
  children: React.ReactNode;
}) {
  return (
    <ThemeProviderRestyle theme={theme === 'dark' ? darkTheme : lightTheme}>
      {children}
    </ThemeProviderRestyle>
  );
}
