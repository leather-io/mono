import type { ReactNode } from 'react';

import { styled } from 'leather-styles/jsx';

interface KbdProps {
  children: ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return (
    <styled.kbd
      textStyle="caption.02"
      color="ink.text-subdued"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="xs"
      px="4px"
      minWidth="18px"
      textAlign="center"
      bg="ink.background-secondary"
      lineHeight="16px"
    >
      {children}
    </styled.kbd>
  );
}
