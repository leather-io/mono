import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

interface PopupFrameProps {
  children: ReactNode;
  overlay?: ReactNode;
}

// The extension popup at its real size. Approver.Actions is position: fixed
// (the popup window is the viewport), so the transform makes this frame the
// containing block for fixed descendants: each board's footer pins to its own
// frame instead of stacking at the bottom of the playground window. Content
// scrolls in the inner box so the footer stays put, as it does in the popup.
export function PopupFrame({ children, overlay }: PopupFrameProps) {
  return (
    <Box
      position="relative"
      width="popupWidth"
      height="popupHeight"
      flexShrink={0}
      overflow="hidden"
      transform="translateZ(0)"
      bg="ink.background-secondary"
      borderWidth={1}
      borderColor="ink.border-default"
    >
      <Box height="100%" overflowY="auto">
        {children}
      </Box>
      {overlay}
    </Box>
  );
}
