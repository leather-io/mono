import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Theme } from '../../../../native';

interface CollectibleCardLayoutProps<Theme extends BaseTheme> extends BoxProps<Theme> {
  children: React.ReactNode;
  height?: number;
}

export function CollectibleCardLayout({
  children,
  height = 200,
  ...props
}: CollectibleCardLayoutProps<Theme>) {
  return (
    <Box width="auto" height={height} overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
