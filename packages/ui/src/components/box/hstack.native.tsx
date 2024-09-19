import { type BoxProps } from '@shopify/restyle';

import { type Theme } from '../../theme-native';
import { Box } from '../box/box.native';

interface HStackProps extends BoxProps<Theme> {
  children: React.ReactNode;
}

export function HStack({ children, ...rest }: HStackProps) {
  return (
    <Box flex={1} flexDirection="row" alignItems="center" {...rest}>
      {children}
    </Box>
  );
}
