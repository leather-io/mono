import { type ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import { Sheet } from '@leather.io/ui';

interface ActionDrawerProps {
  children: ReactNode;
  onClose(): void;
  isShowing: boolean;
}

export function ActionDrawer({ children, onClose, isShowing }: ActionDrawerProps) {
  return (
    <Sheet variant="drawer" wrapChildren={false} onClose={onClose} isShowing={isShowing}>
      <Box
        mt="space.05"
        mb="space.08"
        px="space.05"
        display="flex"
        flexDirection="column"
        gap="space.05"
      >
        {children}
      </Box>
    </Sheet>
  );
}
