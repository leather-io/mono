import { useMemo } from 'react';

import { type CollectibleView } from '@leather.io/features';

import { useFlags } from '@app/features/feature-flags';
import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { CollectiblesLegacy } from './collectibles-legacy';
import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay.web';
import { CollectiblesLayout } from './components/collectibles.layout';
import { InscriptionCard } from './components/inscription-card';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

const CARD_HEIGHT = 184;

function renderCollectible(view: CollectibleView) {
  const asset = view.asset;

  switch (asset.protocol) {
    case 'stamp':
      return <StampCard item={asset} height={CARD_HEIGHT} />;
    case 'sip9':
      return <Sip9Card item={asset} height={CARD_HEIGHT} />;
    case 'inscription':
      return <InscriptionCard item={asset} height={CARD_HEIGHT} />;
    default:
      return null;
  }
}

function CollectiblesCurrent() {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const {
    data: collectibles = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAccountCollectibles(account);

  const renderedCollectibles = useMemo(
    () =>
      collectibles.map(view => (
        <CollectibleTypeIconOverlay protocol={view.protocol} key={view.key}>
          {renderCollectible(view)}
        </CollectibleTypeIconOverlay>
      )),
    [collectibles]
  );

  return (
    <CollectiblesLayout
      isLoading={isLoading}
      isError={isError}
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
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <CollectiblesCurrent /> : <CollectiblesLegacy />;
}
