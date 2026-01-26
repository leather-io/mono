import { Dimensions } from 'react-native';

import { Box, HasChildren } from '@leather.io/ui/native';

interface EmptyLayoutProps extends HasChildren {
  image?: React.ReactNode;
}
// TODO: LEA-3190  ask design for this empty layout
export function EmptyLayoutTab({ children, image }: EmptyLayoutProps) {
  const { height, width } = Dimensions.get('window');
  return (
    <Box height={height / 2} gap="4" alignItems="center" flexShrink={0}>
      <Box height={height / 4} width={width / 2} alignItems="center" justifyContent="center">
        {image}
      </Box>

      {children}
    </Box>
  );
}

export function EmptyLayout({ children, image }: EmptyLayoutProps) {
  const { height, width } = Dimensions.get('window');
  return (
    <Box height={height / 3} gap="4" pt="8" alignItems="center" flexShrink={0}>
      <Box height={height / 2} width={width / 2} alignItems="center" justifyContent="center">
        {image}
      </Box>

      {children}
    </Box>
  );
}
