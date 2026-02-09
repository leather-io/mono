import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  type CollectibleView,
  type TokenDetailsProps,
  createTokenDetailsPath,
} from '@leather.io/features';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay.web';
import { CollectiblesLayout } from './components/collectibles.layout';
import { InscriptionCard } from './components/inscription-card';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

// Figma spec uses 195px square tiles
const CARD_HEIGHT = 195;

function renderCollectible(
  view: CollectibleView,
  onOpenToken?: (details: TokenDetailsProps) => void
) {
  const handleSelect =
    onOpenToken && view.key
      ? () =>
          onOpenToken({
            assetId: view.key as SerializedCryptoAssetId,
          })
      : undefined;

  switch (view.asset.protocol) {
    case 'stamp':
      return <StampCard item={view.asset} height={CARD_HEIGHT} onSelect={handleSelect} />;
    case 'sip9':
      return <Sip9Card item={view.asset} height={CARD_HEIGHT} onSelect={handleSelect} />;
    case 'inscription':
      return <InscriptionCard item={view.asset} height={CARD_HEIGHT} onSelect={handleSelect} />;
    default:
      return null;
  }
}

function CollectiblesCurrent() {
  const navigate = useNavigate();
  const location = useLocation();
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const {
    data: collectibles = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAccountCollectibles(account);

  const handleOpenToken = useCallback(
    ({ assetId }: TokenDetailsProps) => {
      void navigate(createTokenDetailsPath(assetId), { state: { backgroundLocation: location } });
    },
    [navigate, location]
  );

  const renderedCollectibles = useMemo(
    () =>
      collectibles.map((view, index) => (
        <CollectibleTypeIconOverlay
          key={view.key}
          protocol={view.protocol}
          data-testid={`collectible-card-${view.asset.protocol}`}
          data-index={index}
        >
          {renderCollectible(view, handleOpenToken)}
        </CollectibleTypeIconOverlay>
      )),
    [collectibles, handleOpenToken]
  );

  return (
    <CollectiblesLayout
      isLoading={isLoading}
      isError={isError}
      amount={collectibles.length}
      hasCollectibles={collectibles.length > 0}
      onRefresh={() => {
        void refetch();
      }}
      isRefetching={isRefetching}
    >
      {renderedCollectibles}
    </CollectiblesLayout>
  );
}

export function Collectibles() {
  return <CollectiblesCurrent />;
}
