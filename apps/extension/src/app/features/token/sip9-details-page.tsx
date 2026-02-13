import { useState } from 'react';

import { Stack } from 'leather-styles/jsx';

import type { CollectibleView } from '@leather.io/features';
import type { Sip9Asset } from '@leather.io/models';

import { Sip9Card } from '../collectibles/components/sip9-card';
import { CollectibleDetailsActions } from './collectible-details-actions';
import { CollectibleDetailsHeader } from './collectible-details-header';
import { CollectibleDetailsPageLayout } from './collectible-details-page.layout';
import { Sip9Details } from './sip9-details';

interface Sip9DetailsPageProps {
  view: CollectibleView;
  onBack(): void;
}

export function Sip9DetailsPage({ view, onBack }: Sip9DetailsPageProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const asset = view.asset as Sip9Asset;
  const title = view.title || 'Stacks NFT';
  const subtitle = view.subtitle;

  return (
    <Stack width="100%" gap="space.04" data-testid="collectible-details-container">
      <CollectibleDetailsHeader title={title} subtitle={subtitle} onBack={onBack} />
      <CollectibleDetailsPageLayout
        protocol="sip9"
        media={<Sip9Card item={asset} />}
        actions={<CollectibleDetailsActions />}
      >
        <Sip9Details
          asset={asset}
          isDescriptionExpanded={isDescriptionExpanded}
          onToggleDescription={() => setIsDescriptionExpanded(v => !v)}
        />
      </CollectibleDetailsPageLayout>
    </Stack>
  );
}
