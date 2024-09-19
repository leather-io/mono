import { type BoxProps } from '@shopify/restyle';

import { type Theme } from '../../theme-native';
import { Box } from '../box/box.native';

interface AvatarProps extends BoxProps<Theme> {
  children: React.ReactNode;
}

export function Avatar({ children, ...rest }: AvatarProps) {
  return (
    <Box bg="ink.background-secondary" borderRadius="round" p="2" {...rest}>
      {children}
    </Box>
  );
}
