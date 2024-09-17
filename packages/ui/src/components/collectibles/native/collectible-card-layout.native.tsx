import { BaseTheme, BoxProps } from '@shopify/restyle';

import { Box, Theme } from '../../../../native';
import { HasChildren } from '../../../utils/has-children.shared';

type CollectibleCardLayoutProps<Theme extends BaseTheme> = BoxProps<Theme> & HasChildren;

export function CollectibleCardLayout({ children, ...props }: CollectibleCardLayoutProps<Theme>) {
  return (
    <Box width={200} height={200} borderRadius="lg" overflow="hidden" {...props}>
      {children}
    </Box>
  );
}
