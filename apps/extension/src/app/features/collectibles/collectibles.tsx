import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type CollectibleView, createTokenDetailsPath } from '@leather.io/features';
import type { NonFungibleCryptoAsset } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';

import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay';
import { CollectiblesLayout } from './components/collectibles.layout';
import { InscriptionCardActions } from './components/inscription-card-actions';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

interface CollectibleItemProps {
  view: CollectibleView;
  onSelect(asset: NonFungibleCryptoAsset): void;
}
function CollectibleItem({ view, onSelect }: CollectibleItemProps) {
  switch (view.asset.protocol) {
    case 'stamp':
      return <StampCard item={view.asset} onSelect={onSelect} />;
    case 'sip9':
      return <Sip9Card item={view.asset} isBns={view.isBns} onSelect={onSelect} />;
    case 'inscription':
      return <InscriptionCardActions item={view.asset} onSelect={onSelect} />;
    default:
      return null;
  }
}

export function Collectibles() {
  const accountId = useCurrentAccountId();
  const account = useAccountAddresses(accountId);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: collectibles = [],
    isPending,
    isError,
    isFetching,
    refetch,
  } = useAccountCollectibles(account);

  const handleSelectCollectible = useCallback(
    (asset: NonFungibleCryptoAsset) => {
      const assetId = serializeAssetId(getAssetId(asset));
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
          <CollectibleItem view={view} onSelect={handleSelectCollectible} />
        </CollectibleTypeIconOverlay>
      )),
    [collectibles, handleSelectCollectible]
  );

  const hasInscriptions = collectibles.some(c => c.asset.protocol === 'inscription');

  return (
    <CollectiblesLayout
      isLoading={isPending}
      isFetching={isFetching}
      isError={isError}
      amount={collectibles.length}
      hasCollectibles={collectibles.length > 0}
      hasInscriptions={hasInscriptions}
      onRefresh={() => void refetch()}
    >
      {renderedCollectibles}
    </CollectiblesLayout>
  );
}
