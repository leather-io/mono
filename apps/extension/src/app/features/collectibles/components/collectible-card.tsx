import type { ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

import { Box, type BoxProps } from 'leather-styles/jsx';

interface CollectibleCardProps extends BoxProps {
  children: ReactNode;
}

export function CollectibleCard({ children, ...props }: CollectibleCardProps) {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <Box
      ref={ref}
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
        {inView ? children : null}
      </Box>
    </Box>
  );
}
