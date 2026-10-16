import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

interface PopupFrameProps {
  caption: string;
  theme: 'light' | 'dark';
  frameId: string;
  children: ReactNode;
}

export function PopupFrame({ caption, theme, frameId, children }: PopupFrameProps) {
  return (
    <Stack gap="space.02" flexShrink={0}>
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {caption}
      </styled.span>
      <Box
        data-scenario-frame={frameId}
        className={theme === 'dark' ? 'dark' : undefined}
        position="relative"
        width="popupWidth"
        height="popupHeight"
        flexShrink={0}
        overflow="hidden"
        transform="translateZ(0)"
        bg="ink.background-primary"
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="sm"
        boxShadow="0 1px 2px rgba(18, 16, 15, 0.04), 0 12px 32px rgba(18, 16, 15, 0.08)"
      >
        {children}
      </Box>
    </Stack>
  );
}
