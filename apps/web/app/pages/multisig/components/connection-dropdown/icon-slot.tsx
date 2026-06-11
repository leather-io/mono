import type { ReactNode } from 'react';

import { Flex } from 'leather-styles/jsx';

interface IconSlotProps {
  children: ReactNode;
}

export function IconSlot({ children }: IconSlotProps) {
  return (
    <Flex width="32px" alignItems="center" justifyContent="center" flexShrink={0}>
      {children}
    </Flex>
  );
}
