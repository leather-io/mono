import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { ItemLayout } from '../item-layout/item-layout.web';

export type ListItemDensity = 'default' | 'compact';

interface ListItemBoxProps {
  title: ReactNode;
  leading?: ReactNode;
  caption?: ReactNode;
  trailing?: ReactNode;
  trailingCaption?: ReactNode;
  density?: ListItemDensity;
  highlight?: 'attention';
  onClick?(): void;
}

const attentionGradient =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.16), rgb(from token(colors.orange.action-primary-default) r g b / 0) 70%)';
const attentionGradientHover =
  'linear-gradient(90deg, rgb(from token(colors.orange.action-primary-default) r g b / 0.28), rgb(from token(colors.orange.action-primary-default) r g b / 0) 80%)';

function rowHover(interactive: boolean, attention: boolean) {
  if (!interactive) return undefined;
  return attention ? { bgImage: attentionGradientHover } : { bg: 'ink.component-background-hover' };
}

export function ListItemBox({
  title,
  leading,
  caption,
  trailing,
  trailingCaption,
  density = 'default',
  highlight,
  onClick,
}: ListItemBoxProps) {
  const attention = highlight === 'attention';
  return (
    <styled.button
      type="button"
      onClick={onClick}
      display="block"
      width="100%"
      textAlign="left"
      border="none"
      bg="transparent"
      borderRadius="sm"
      cursor={onClick ? 'pointer' : 'default'}
      px="space.03"
      py={density === 'compact' ? 'space.02' : 'space.03'}
      bgImage={attention ? attentionGradient : undefined}
      _hover={rowHover(Boolean(onClick), attention)}
    >
      <Flex alignItems="center" gap={density === 'compact' ? 'space.03' : 'space.04'} width="100%">
        {leading ? <Box flexShrink={0}>{leading}</Box> : null}
        <Box flex={1} minWidth={0}>
          <ItemLayout
            gap="space.00"
            titleLeft={title}
            captionLeft={caption}
            titleRight={trailing}
            captionRight={trailingCaption}
          />
        </Box>
      </Flex>
    </styled.button>
  );
}
