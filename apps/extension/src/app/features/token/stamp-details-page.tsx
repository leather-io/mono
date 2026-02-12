import { Stack } from 'leather-styles/jsx';

import type { CollectibleView } from '@leather.io/features';
import type { StampAsset } from '@leather.io/models';

import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { StampCard } from '../collectibles/components/stamp-card';
import { CollectibleDetailsActions } from './collectible-details-actions';
import { CollectibleDetailsHeader } from './collectible-details-header';
import {
  CollectibleDetailsPageLayout,
  getCollectibleMediaHeight,
} from './collectible-details-page.layout';
import { StampDetails } from './stamp-details';

interface StampDetailsPageProps {
  view: CollectibleView;
  onBack(): void;
}

export function StampDetailsPage({ view, onBack }: StampDetailsPageProps) {
  const network = useCurrentNetwork();

  const asset = view.asset as StampAsset;
  const title = view.title || 'Stamp';
  const subtitle = view.subtitle;

  return (
    <Stack width="100%" gap="space.04" data-testid="collectible-details-container">
      <CollectibleDetailsHeader title={title} subtitle={subtitle} onBack={onBack} />
      <CollectibleDetailsPageLayout
        protocol="stamp"
        media={<StampCard item={asset} height={getCollectibleMediaHeight()} />}
        actions={<CollectibleDetailsActions />}
      >
        <StampDetails asset={asset} bitcoinNetwork={network.chain.bitcoin.bitcoinNetwork} />
      </CollectibleDetailsPageLayout>
    </Stack>
  );
}
