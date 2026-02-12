import type { ReactNode } from 'react';

import { Box, Stack } from 'leather-styles/jsx';

import { isPopupMode } from '@app/common/utils';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';

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
    <Stack
      px={{ base: 'space.04', md: 'space.00' }}
      width="100%"
      maxWidth={{ base: '100%', md: '780px' }}
      margin="0 auto"
      gap="space.05"
    >
      <Stack gap="space.04" alignItems="center">
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
      {children}
    </Stack>
  );
}

export function getCollectibleMediaHeight(): number {
  return isPopupMode() ? maxImageSize : maxImageSize;
}
