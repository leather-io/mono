import type { ReactNode } from 'react';

import { Box, Flex, HStack, styled } from 'leather-styles/jsx';

import { ItemLayout } from '../item-layout/item-layout.web';

export type ListItemDensity = 'default' | 'compact';
type ListItemVariant = 'boxed' | 'plain';

interface ListItemBoxProps {
  title: ReactNode;
  // Inline node beside the title (a status badge, a "(me)" suffix) — not stacked
  // below it like a caption.
  titleAccessory?: ReactNode;
  leading?: ReactNode;
  caption?: ReactNode;
  trailing?: ReactNode;
  trailingCaption?: ReactNode;
  density?: ListItemDensity;
  // 'boxed' owns its chrome (padding, radius, hover, attention wash, click
  // target) — for standalone rows like the transaction feed. 'plain' is just the
  // content row, for use inside a card that already supplies per-row padding,
  // dividers and any highlight wash.
  variant?: ListItemVariant;
  // Full-bleed mode for rows sitting flush inside a bordered list container
  // with dividers: drops the row's own corner radius so hover and attention
  // washes run edge to edge.
  flush?: boolean;
  highlight?: 'attention';
  action?: ReactNode;
  onClick?(): void;
}

const attentionGradient =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.1), rgb(from token(colors.orange.action-primary-default) r g b / 0))';
const attentionGradientHover =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.14), rgb(from token(colors.orange.action-primary-default) r g b / 0))';

export function ListItemBox({
  title,
  titleAccessory,
  leading,
  caption,
  trailing,
  trailingCaption,
  density = 'default',
  variant = 'boxed',
  flush = false,
  highlight,
  action,
  onClick,
}: ListItemBoxProps) {
  const attention = highlight === 'attention';
  const gap = density === 'compact' ? 'space.03' : 'space.04';
  const titleNode = titleAccessory ? (
    <HStack gap="space.02" minWidth={0} alignItems="center">
      {title}
      {titleAccessory}
    </HStack>
  ) : (
    title
  );
  const layout = (
    <ItemLayout
      gap="space.00"
      columnGap="space.04"
      titleLeft={titleNode}
      captionLeft={caption}
      titleRight={trailing}
      captionRight={trailingCaption}
    />
  );

  // Plain: no chrome — just the content row plus an optional inline action. The
  // parent card owns padding, dividers and any highlight wash, so clicks are
  // handled there too (no row-level button/hover here).
  if (variant === 'plain') {
    return (
      <Flex alignItems="center" gap={gap} width="100%" minWidth={0}>
        {leading ? <Box flexShrink={0}>{leading}</Box> : null}
        <Box flex={1} minWidth={0}>
          {layout}
        </Box>
        {action ? <Box flexShrink={0}>{action}</Box> : null}
      </Flex>
    );
  }

  const content = (
    <Flex alignItems="center" gap={gap} width="100%" minWidth={0}>
      {leading ? <Box flexShrink={0}>{leading}</Box> : null}
      <Box flex={1} minWidth={0}>
        {layout}
      </Box>
    </Flex>
  );
  // The visual (attention wash + hover + padding) lives on the outer row, and the
  // click target and the optional action sit inside as siblings — so `action`
  // can be a real Button without nesting it in the row's button. Background-image
  // (not the `bg` shorthand, which would reset it) carries the wash. Built inline
  // (not via a helper): Panda extracts hover styles by statically reading the JSX,
  // so a function's return value is invisible to it and no hover rule gets made.
  const interactiveHover = attention
    ? { bgImage: attentionGradientHover }
    : { bg: 'ink.component-background-hover' };
  return (
    <Flex
      alignItems="center"
      gap={gap}
      width="100%"
      borderRadius={flush ? 'none' : 'sm'}
      px="space.04"
      py={density === 'compact' ? 'space.03' : 'space.04'}
      bgImage={attention ? attentionGradient : undefined}
      _hover={onClick ? interactiveHover : undefined}
    >
      {onClick ? (
        <styled.button
          type="button"
          onClick={onClick}
          flex={1}
          minWidth={0}
          display="block"
          textAlign="left"
          border="none"
          backgroundColor="transparent"
          cursor="pointer"
          p="0"
        >
          {content}
        </styled.button>
      ) : (
        <Box flex={1} minWidth={0}>
          {content}
        </Box>
      )}
      {action ? <Box flexShrink={0}>{action}</Box> : null}
    </Flex>
  );
}
