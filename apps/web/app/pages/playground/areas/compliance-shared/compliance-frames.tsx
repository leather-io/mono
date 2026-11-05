import { type ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

type ExtensionSurface = 'popup' | 'request-window';
export type ComplianceSurface = ExtensionSurface | 'tab';

export const surfaceLabels: Record<ComplianceSurface, string> = {
  popup: 'Extension popup · 390 × 600',
  'request-window': 'Request window · 390 × 756',
  tab: 'Full-page tab',
};

interface ExtensionFrameProps {
  surface: ExtensionSurface;
  children: ReactNode;
}
// The popup and request window, at their real sizes. translateZ(0) makes the frame the
// containing block for the Approver's fixed footer.
export function ExtensionFrame({ surface, children }: ExtensionFrameProps) {
  return (
    <Box
      position="relative"
      width="popupWidth"
      height={surface === 'request-window' ? 'popupHeight' : 'dialogHeight'}
      flexShrink={0}
      overflow="hidden"
      transform="translateZ(0)"
      bg="ink.background-primary"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      boxShadow="0 12px 40px rgba(18, 16, 15, 0.12)"
      data-testid="compliance-frame"
      data-surface={surface}
    >
      <Box height="100%" overflowY="auto">
        {children}
      </Box>
    </Box>
  );
}

export function BrowserTabFrame({ children }: { children: ReactNode }) {
  return (
    <Flex
      direction="column"
      width="1040px"
      maxWidth="100%"
      height="700px"
      flexShrink={0}
      overflow="hidden"
      transform="translateZ(0)"
      bg="ink.background-primary"
      borderRadius="10px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      boxShadow="0 12px 40px rgba(18, 16, 15, 0.12)"
      data-testid="compliance-frame"
      data-surface="tab"
    >
      <Flex
        alignItems="center"
        gap="space.03"
        height="40px"
        px="space.04"
        flexShrink={0}
        bg="ink.background-secondary"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderColor="ink.border-default"
      >
        <Flex gap="6px">
          {['#FF5F57', '#FEBC2E', '#28C840'].map(color => (
            <Box
              key={color}
              width="12px"
              height="12px"
              borderRadius="50%"
              style={{ backgroundColor: color }}
            />
          ))}
        </Flex>
        <Box
          flex={1}
          maxWidth="520px"
          mx="auto"
          px="space.03"
          py="space.01"
          borderRadius="round"
          bg="ink.background-primary"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="ink.border-default"
        >
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            chrome-extension://…/index.html#/
          </styled.span>
        </Box>
        <Box width="54px" />
      </Flex>
      <Box flex={1} minHeight={0} overflowY="auto">
        {children}
      </Box>
    </Flex>
  );
}
