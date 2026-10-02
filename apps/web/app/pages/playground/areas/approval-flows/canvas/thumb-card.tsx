import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

const thumbCard = css({
  '& [data-thumb-surface]': {
    transition: 'outline-color 160ms ease, box-shadow 160ms ease',
  },
  '&:hover [data-thumb-surface]': {
    outlineColor: 'ink.text-primary',
    boxShadow: '0 8px 24px rgba(18, 16, 15, 0.12)',
  },
  '&[data-active] [data-thumb-surface]': {
    outline: '2px solid',
    outlineColor: 'ink.action-primary-default',
  },
  '&[data-canvas-flash] [data-thumb-surface]': {
    outline: '2px solid',
    outlineColor: 'ink.action-primary-default',
    boxShadow: '0 0 0 6px rgba(18, 16, 15, 0.08)',
  },
  '&:has(button:focus-visible) [data-thumb-surface]': {
    outline: '2px solid',
    outlineColor: 'ink.text-primary',
  },
});

interface ThumbCardProps {
  id?: string;
  width: number;
  label?: string;
  tag?: string;
  title?: string;
  actionLabel: string;
  isActive?: boolean;
  scrollExtra?: number;
  onOpen(): void;
  children: ReactNode;
}

export function ThumbCard({
  id,
  width,
  label,
  tag,
  title,
  actionLabel,
  isActive = false,
  scrollExtra,
  onOpen,
  children,
}: ThumbCardProps) {
  return (
    <Stack
      id={id}
      data-active={isActive || undefined}
      data-scroll-extra={scrollExtra}
      className={thumbCard}
      position="relative"
      gap="space.02"
      minWidth="0"
      style={{ width }}
    >
      {children}
      {label && (
        <styled.span
          textStyle="caption.01"
          color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
          lineClamp={2}
        >
          {label}
        </styled.span>
      )}
      {tag && (
        <Flex alignItems="center" gap="space.01" mt="-space.01" data-thumb-tag>
          <Box
            width="6px"
            height="6px"
            flexShrink={0}
            borderRadius="round"
            borderWidth={1}
            borderColor="ink.text-subdued"
          />
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            {tag}
          </styled.span>
        </Flex>
      )}
      <styled.button
        type="button"
        aria-label={actionLabel}
        title={title}
        onClick={onOpen}
        position="absolute"
        inset="0"
        bg="transparent"
        cursor="zoom-in"
        outline="none"
      />
    </Stack>
  );
}
