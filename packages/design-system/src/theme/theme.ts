import { baseColors } from '@leather-wallet/tokens';
import { createTheme } from '@shopify/restyle';

import { textVariants } from './textVariants';

export const theme = createTheme({
  colors: baseColors,
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
