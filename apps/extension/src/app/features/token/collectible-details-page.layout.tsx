import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay';

interface CollectibleDetailsPageLayoutProps {
  children: ReactNode;
  media: ReactNode;
  protocol: 'inscription' | 'sip9' | 'stamp';
  actions?: ReactNode;
}

const maxImageSize = 280;

export function CollectibleDetailsPageLayout({
  children,
  media,
  protocol,
  actions,
}: CollectibleDetailsPageLayoutProps) {
  return (
    <Stack width="100%" gap="space.00">
      <Stack
        px={{ base: 'space.04', md: 'space.00' }}
        pb="space.05"
        width="100%"
        maxWidth={{ base: '100%', md: '780px' }}
        margin="0 auto"
        gap="space.04"
        alignItems="center"
      >
        <Box
          width="100%"
          maxWidth={`${maxImageSize}px`}
          bg="ink.background-primary"
          borderRadius="sm"
          overflow="hidden"
        >
          <CollectibleTypeIconOverlay protocol={protocol}>{media}</CollectibleTypeIconOverlay>
        </Box>
        {actions}
      </Stack>
      <Box bg="ink.background-secondary" width="100%" py="space.04">
        <Stack
          px={{ base: 'space.04', md: 'space.00' }}
          width="100%"
          maxWidth={{ base: '100%', md: '780px' }}
          margin="0 auto"
          gap="space.02"
        >
          {children}
        </Stack>
      </Box>
    </Stack>
  );
}
