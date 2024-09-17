import { Box, BoxProps } from 'leather-styles/jsx';

import { HasChildren } from '../../../../../utils/has-children.shared';

export function InscriptionPreviewLayout({ children, ...props }: HasChildren & BoxProps) {
  return (
    <Box
      bg="black"
      borderRadius="xs"
      width="100px"
      height="100px"
      overflow="hidden"
      position="relative"
      {...props}
    >
      {children}
    </Box>
  );
}
