import { useState } from 'react';
import { useNavigate } from 'react-router';

import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { Stack } from 'leather-styles/jsx';

import type { CollectibleView } from '@leather.io/features';

import { RouteUrls } from '@shared/route-urls';
import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { Sip9Card } from '../collectibles/components/sip9-card';
import { CollectibleDetailsHeader } from './collectible-details-header';
import { CollectibleDetailsPageLayout } from './collectible-details-page.layout';
import { TokenDetailsPillButton } from './components/token-details-actions';
import { Sip9Details } from './sip9-details';

interface Sip9DetailsPageProps {
  view: CollectibleView;
  onBack(): void;
}

export function Sip9DetailsPage({ view, onBack }: Sip9DetailsPageProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const navigate = useNavigate();
  const policy = useCurrentPolicy();
  const canSend = view.kind !== 'legacy-bns' && !policy;

  const asset = view.asset;
  const title = view.title || 'Stacks NFT';
  const subtitle = view.subtitle;

  return (
    <Stack
      width="100%"
      gap="space.04"
      data-testid={CollectiblesSelectors.CollectibleDetailsContainer}
    >
      <CollectibleDetailsHeader title={title} subtitle={subtitle} onBack={onBack} />
      <CollectibleDetailsPageLayout
        protocol="sip9"
        media={<Sip9Card item={asset} kind={view.kind} />}
        actions={
          canSend && (
            <TokenDetailsPillButton
              label="Send"
              testId={CollectiblesSelectors.CollectibleSendBtn}
              onClick={() =>
                void navigate(
                  replaceRouteParams(RouteUrls.SendCollectible, {
                    assetId: asset.assetId,
                    tokenId: asset.tokenId,
                  })
                )
              }
            />
          )
        }
      >
        <Sip9Details
          asset={asset}
          kind={view.kind}
          isDescriptionExpanded={isDescriptionExpanded}
          onToggleDescription={() => setIsDescriptionExpanded(v => !v)}
        />
      </CollectibleDetailsPageLayout>
    </Stack>
  );
}
