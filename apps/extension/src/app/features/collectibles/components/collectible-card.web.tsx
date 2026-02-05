import { type ComponentProps, type ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

type BoxProps = ComponentProps<typeof Box>;

interface CollectibleCardProps extends BoxProps {
  children: ReactNode;
  height?: number;
}

export function CollectibleCard({ children, height = 200, ...props }: CollectibleCardProps) {
  return (
    <Box width="auto" height={height} overflow="hidden" borderRadius="sm" {...props}>
      {children}
    </Box>
  );
}
