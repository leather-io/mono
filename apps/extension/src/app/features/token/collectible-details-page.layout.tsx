import type { ReactNode } from 'react';

import { Stack } from 'leather-styles/jsx';

import { isPopupMode } from '@app/common/utils';

import { CollectibleTypeIconOverlay } from '../collectibles/components/collectible-type-icon-overlay.web';
import { SectionCard } from './collectible-details.layout';

interface CollectibleDetailsPageLayoutProps {
  children: ReactNode;
  media: ReactNode;
  protocol: 'inscription' | 'sip9' | 'stamp';
}

export function CollectibleDetailsPageLayout({
  children,
  media,
  protocol,
}: CollectibleDetailsPageLayoutProps) {
  return (
    <Stack
      px={{ base: 'space.04', md: 'space.00' }}
      width="100%"
      maxWidth={{ base: '100%', md: '780px' }}
      margin="0 auto"
      gap="space.04"
    >
      <SectionCard>
        <CollectibleTypeIconOverlay protocol={protocol}>{media}</CollectibleTypeIconOverlay>
      </SectionCard>
      {children}
    </Stack>
  );
}

export function getCollectibleMediaHeight(): number {
  return isPopupMode() ? 342 : 320;
}
