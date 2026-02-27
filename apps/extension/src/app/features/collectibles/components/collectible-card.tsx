import type { ReactNode } from 'react';

import { Box, type BoxProps } from 'leather-styles/jsx';

interface CollectibleCardProps extends BoxProps {
  children: ReactNode;
}

export function CollectibleCard({ children, ...props }: CollectibleCardProps) {
  return (
    <Box
      width="100%"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        display: 'block',
        paddingBottom: '100%',
      }}
      {...props}
    >
      <Box position="absolute" inset={0}>
        {children}
      </Box>
    </Box>
  );
}
