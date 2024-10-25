import { type BoxProps } from '@shopify/restyle';

import { type Theme } from '../../theme-native';
import { Box } from '../box/box.native';

interface AvatarProps extends BoxProps<Theme> {
  children: React.ReactNode;
  testID?: string;
}
export function Avatar({ children, testID, ...rest }: AvatarProps) {
  return (
    <Box bg="ink.background-secondary" borderRadius="round" p="2" testID={testID} {...rest}>
      {children}
    </Box>
  );
}
