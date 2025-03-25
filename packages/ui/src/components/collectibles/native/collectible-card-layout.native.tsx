import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Theme } from '../../../../native';

interface CollectibleCardLayoutProps<Theme extends BaseTheme> extends BoxProps<Theme> {
  children: React.ReactNode;
  size?: number;
}

export function CollectibleCardLayout({
  children,
  size = 200,
  ...props
}: CollectibleCardLayoutProps<Theme>) {
  return (
    <Box width={size} height={size} borderRadius="lg" overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
