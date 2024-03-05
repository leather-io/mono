import { colorThemes, getMobileTextVariants } from '@leather-wallet/tokens';
import { ThemeProvider as ThemeProviderRestyle, createTheme } from '@shopify/restyle';

const textVariants = getMobileTextVariants();

export const theme = createTheme({
  colors: colorThemes.base,
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
});

export type Theme = typeof theme;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProviderRestyle theme={theme}>{children}</ThemeProviderRestyle>;
}
