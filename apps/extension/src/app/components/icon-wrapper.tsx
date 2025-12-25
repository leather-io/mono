import { Box } from 'leather-styles/jsx';

import type { HasChildren } from '@app/common/has-children';

export function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      width="40px"
      height="40px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="100%"
      background="ink.component-background-hover"
      border="1px solid"
      borderColor="ink.component-background-hover"
      flexShrink="0"
    >
      {children}
    </Box>
  );
}

// TODO: seems like the design got updated for the icon wrapper. Should we update all of the instances of the icon wrapper?
export function NewIconWrapper({ children }: HasChildren) {
  return (
    <Box
      p="space.03"
      borderRadius="round"
      backgroundColor="ink.background-secondary"
      borderColor="ink.component-background-hover"
      borderWidth={1}
    >
      {children}
    </Box>
  );
}
