import type { ReactNode } from 'react';

import { Box, Flex, HStack, styled } from 'leather-styles/jsx';

import { ItemLayout } from '@leather.io/ui';

interface VaultListItemProps {
  leading: ReactNode;
  title: ReactNode;
  titleAccessory?: ReactNode;
  caption?: ReactNode;
  trailingTitle?: ReactNode;
  trailingSubtitle?: ReactNode;
  tightLeading?: boolean;
}

export function VaultListItem({
  leading,
  title,
  titleAccessory,
  caption,
  trailingTitle,
  trailingSubtitle,
  tightLeading,
}: VaultListItemProps) {
  const titleLeft = titleAccessory ? (
    <HStack gap="space.01" minWidth={0} alignItems="center">
      <styled.span
        textStyle="label.02"
        minWidth={0}
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {title}
      </styled.span>
      {titleAccessory}
    </HStack>
  ) : (
    title
  );

  return (
    <Flex alignItems="center" gap={tightLeading ? 'space.02' : 'space.04'} width="100%">
      <Box flexShrink={0}>{leading}</Box>
      <Box flex={1} minWidth={0}>
        <ItemLayout
          gap="space.00"
          titleLeft={titleLeft}
          captionLeft={caption}
          titleRight={trailingTitle}
          captionRight={trailingSubtitle}
        />
      </Box>
    </Flex>
  );
}
