import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

interface ConnectOverlayBackdropProps {
  // Off once connected, when the same tree renders live and interactive.
  isActive?: boolean;
  children: ReactNode;
}

// Pushes the page behind a connect overlay into a blurred, inert preview of
// what the screen looks like once connected.
export function ConnectOverlayBackdrop({ isActive = true, children }: ConnectOverlayBackdropProps) {
  return (
    <Box
      filter={isActive ? 'blur(6px)' : 'none'}
      transform={isActive ? 'scale(0.97)' : 'none'}
      pointerEvents={isActive ? 'none' : 'auto'}
      userSelect={isActive ? 'none' : 'unset'}
    >
      {children}
    </Box>
  );
}

// Centres a ConnectCard over the content area, offset for the side navigation
// and the sticky header.
export function ConnectOverlay({ children }: { children: ReactNode }) {
  return (
    <Box position="absolute" inset="0" pointerEvents="none">
      <Box
        position="sticky"
        top="50dvh"
        transform="translateY(-50%)"
        display="flex"
        justifyContent="center"
        px="space.04"
      >
        {children}
      </Box>
    </Box>
  );
}
