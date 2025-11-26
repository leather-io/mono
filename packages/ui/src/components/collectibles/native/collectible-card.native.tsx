import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Theme } from '../../../native';

interface CollectibleCardProps<Theme extends BaseTheme> extends BoxProps<Theme> {
  children: React.ReactNode;
  height?: number;
}

export function CollectibleCard({ children, height = 200, ...props }: CollectibleCardProps<Theme>) {
  return (
    <Box width="auto" height={height} overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
