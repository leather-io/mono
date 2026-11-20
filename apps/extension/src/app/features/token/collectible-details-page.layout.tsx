import type { ReactNode } from 'react';

import { Box, Flex, Stack } from 'leather-styles/jsx';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay';

interface CollectibleDetailsPageLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  media: ReactNode;
  protocol: 'sip9';
}

const maxImageSize = 342;

export function CollectibleDetailsPageLayout({
  actions,
  children,
  media,
  protocol,
}: CollectibleDetailsPageLayoutProps) {
  return (
    <Stack width="100%" maxWidth={{ base: '100%', md: '780px' }} margin="0 auto" gap="space.00">
      <Stack
        bg="ink.background-primary"
        p="space.05"
        gap="space.04"
        alignItems="center"
        justifyContent="center"
      >
        <Box width="100%" maxWidth={`${maxImageSize}px`} borderRadius="xs" overflow="hidden">
          <CollectibleTypeIconOverlay protocol={protocol}>{media}</CollectibleTypeIconOverlay>
        </Box>
        {actions && (
          <Flex width="100%" maxWidth={`${maxImageSize}px`} gap="space.02">
            {actions}
          </Flex>
        )}
      </Stack>
      <Stack bg="ink.background-secondary" gap="space.00">
        {children}
      </Stack>
    </Stack>
  );
}
