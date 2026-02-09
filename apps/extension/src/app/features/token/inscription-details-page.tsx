import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Stack } from 'leather-styles/jsx';

import { ORD_IO_URL } from '@leather.io/constants';
import type { CollectibleView } from '@leather.io/features';
import type { InscriptionAsset } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

import { InscriptionCard } from '../collectibles/components/inscription-card';
import { CollectibleDetailsHeader } from './collectible-details-header';
import {
  CollectibleDetailsPageLayout,
  getCollectibleMediaHeight,
} from './collectible-details-page.layout';
import { InscriptionDetails } from './inscription-details';

interface InscriptionDetailsPageProps {
  view: CollectibleView;
  onBack(): void;
}

export function InscriptionDetailsPage({ view, onBack }: InscriptionDetailsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const network = useCurrentNetwork();
  const { hasInscriptionBeenDiscarded, discardInscription, recoverInscription } =
    useCurrentAccountDiscardedInscriptions();

  const inscription = view.asset as InscriptionAsset;
  const isDiscarded = hasInscriptionBeenDiscarded(inscription);

  const handleSend = useCallback(() => {
    void navigate(`/${RouteUrls.SendOrdinalInscription}`, {
      state: { inscription, backgroundLocation: location },
    });
  }, [navigate, inscription, location]);

  const handleViewOriginal = useCallback(() => {
    openInNewTab(`${ORD_IO_URL}/${inscription.number}`);
  }, [inscription]);

  const handleToggleProtection = useCallback(() => {
    if (isDiscarded) {
      recoverInscription(inscription);
    } else {
      discardInscription(inscription);
    }
  }, [inscription, isDiscarded, recoverInscription, discardInscription]);

  const title = view.title || 'Inscription';
  const subtitle = view.subtitle || '';

  return (
    <Stack width="100%" gap="space.04" data-testid="collectible-details-container">
      <CollectibleDetailsHeader
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        onSend={handleSend}
        onViewOriginal={handleViewOriginal}
        onToggleProtection={handleToggleProtection}
        isProtected={!isDiscarded}
      />
      <CollectibleDetailsPageLayout
        protocol="inscription"
        media={<InscriptionCard item={inscription} height={getCollectibleMediaHeight()} />}
      >
        <InscriptionDetails
          asset={inscription}
          bitcoinNetwork={network.chain.bitcoin.bitcoinNetwork}
        />
      </CollectibleDetailsPageLayout>
    </Stack>
  );
}
