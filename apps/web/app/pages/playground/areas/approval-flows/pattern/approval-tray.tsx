import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { CloseIcon } from '@leather.io/ui';

import { hiddenScrollbar } from './approval-shell';
import { approvalDivider, approvalSurface } from './approval-surface';

const trayHeaderEdge = css({
  '[data-approval-containers=interactive] &': { borderBottomWidth: 0 },
});

interface ApprovalTrayProps {
  title: string;
  children: ReactNode;
  maxHeight?: string;
  footer?: ReactNode;
}

export function ApprovalTray({ title, children, maxHeight = '78%', footer }: ApprovalTrayProps) {
  return (
    <Flex
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      direction="column"
      justifyContent="flex-end"
      bg="ink.background-overlay"
    >
      <Stack
        gap="0"
        bg="ink.background-primary"
        borderTopRadius="lg"
        borderTopWidth={1}
        borderColor="ink.border-default"
        style={{ maxHeight }}
        overflow="hidden"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          px="space.05"
          py="space.04"
          borderBottomWidth={1}
          borderColor="ink.border-default"
          className={trayHeaderEdge}
        >
          <styled.h2 textStyle="label.01">{title}</styled.h2>
          <CloseIcon variant="small" />
        </Flex>
        <Box overflowY="auto" className={hiddenScrollbar} pb={footer ? 'space.02' : 'space.05'}>
          {children}
        </Box>
        {footer && (
          <Box flexShrink={0} px="space.05" pt="space.03" pb="space.05" className={approvalDivider}>
            {footer}
          </Box>
        )}
      </Stack>
    </Flex>
  );
}

interface ApprovalPanelProps {
  children: ReactNode;
  maxHeight?: string;
  mono?: boolean;
}

export function ApprovalPanel({ children, maxHeight = '176px', mono }: ApprovalPanelProps) {
  return (
    <Box
      className={approvalSurface.inset}
      px="space.04"
      py="space.03"
      overflowY="auto"
      style={{ maxHeight }}
      textStyle={mono ? 'code' : 'body.02'}
      whiteSpace="pre-wrap"
      wordBreak="break-word"
    >
      {children}
    </Box>
  );
}
