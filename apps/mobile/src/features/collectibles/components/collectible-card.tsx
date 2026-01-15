import type { ReactNode } from 'react';

import { type BaseTheme, type BoxProps as RestyleBoxProps } from '@shopify/restyle';

import { Box, type Theme } from '@leather.io/ui/native';

interface CollectibleCardProps<ThemeType extends BaseTheme> extends RestyleBoxProps<ThemeType> {
  children: ReactNode;
  height?: number;
}

export function CollectibleCard({ children, height = 200, ...props }: CollectibleCardProps<Theme>) {
  return (
    <Box width="auto" height={height} overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
