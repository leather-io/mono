import { type ComponentProps, type ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

type BoxProps = ComponentProps<typeof Box>;

interface CollectibleCardProps extends BoxProps {
  children: ReactNode;
}

export function CollectibleCard({ children, ...props }: CollectibleCardProps) {
  return (
    <Box
      width="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xs"
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
