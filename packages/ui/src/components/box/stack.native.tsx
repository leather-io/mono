import { type BaseTheme, type BoxProps } from '@shopify/restyle';

import { type Theme } from '../../theme-native';
import { Box } from '../box/box.native';

interface StackProps<Theme extends BaseTheme> extends BoxProps<Theme> {
  children: React.ReactNode;
}

export function Stack({ children, ...rest }: StackProps<Theme>) {
  return (
    <Box flex={1} flexDirection="column" alignItems="center" {...rest}>
      {children}
    </Box>
  );
}
