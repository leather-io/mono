import { useMemo } from 'react';

import type { CollectibleView } from '@leather.io/features';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay.web';
import { CollectiblesLayout } from './components/collectibles.layout';
import { InscriptionCard } from './components/inscription-card';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

function renderCollectible(view: CollectibleView) {
  switch (view.asset.protocol) {
    case 'stamp':
      return <StampCard item={view.asset} />;
    case 'sip9':
      return <Sip9Card item={view.asset} />;
    case 'inscription':
      return <InscriptionCard item={view.asset} />;
    default:
      return null;
  }
}

export function Collectibles() {
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const { data: collectibles = [], isPending, isError, refetch } = useAccountCollectibles(account);

  const renderedCollectibles = useMemo(
    () =>
      collectibles.map((view, index) => (
        <CollectibleTypeIconOverlay
          key={view.key}
          protocol={view.protocol}
          data-testid={`collectible-card-${view.asset.protocol}`}
          data-index={index}
        >
          {renderCollectible(view)}
        </CollectibleTypeIconOverlay>
      )),
    [collectibles]
  );

  return (
    <CollectiblesLayout
      isLoading={isPending}
      isError={isError}
      amount={collectibles.length}
      hasCollectibles={collectibles.length > 0}
      onRefresh={() => void refetch()}
    >
      {renderedCollectibles}
    </CollectiblesLayout>
  );
}
