import { HasChildren } from '@/utils/types';
import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

type CollectiblesCardLayoutProps<Theme extends BaseTheme> = BoxProps<Theme> & HasChildren;

export function CollectiblesCardLayout({ children, ...props }: CollectiblesCardLayoutProps<Theme>) {
  return (
    <Box width={200} height={200} borderRadius="lg" overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
