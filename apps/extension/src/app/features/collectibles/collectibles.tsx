import { useMemo } from 'react';

import { styled } from 'leather-styles/jsx';

import type { NonFungibleCryptoAsset } from '@leather.io/models';
import { ArrowRotateRightLeftIcon, Callout, Spinner } from '@leather.io/ui';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';

import { CollectibleCard } from './components/collectible-card.web';
import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay.web';
import { ImageUnavailable } from './components/image-unavailable.web';
import { InscriptionCard } from './components/inscription-card';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

const CARD_HEIGHT = 184;

function renderCollectible(item: NonFungibleCryptoAsset) {
  switch (item.protocol) {
    case 'stamp':
      return <StampCard item={item} height={CARD_HEIGHT} />;
    case 'sip9':
      return <Sip9Card item={item} height={CARD_HEIGHT} />;
    case 'inscription':
      return <InscriptionCard item={item} height={CARD_HEIGHT} />;
    default:
      return (
        <CollectibleCard height={CARD_HEIGHT}>
          <ImageUnavailable height={CARD_HEIGHT} />
        </CollectibleCard>
      );
  }
}

export function Collectibles() {
  const {
    data: collectibles = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAccountCollectibles();

  const renderedCollectibles = useMemo(
    () =>
      collectibles.map(collectible => {
        const key = serializeAssetId(getAssetId(collectible));
        return (
          <CollectibleTypeIconOverlay protocol={collectible.protocol} key={key}>
            {renderCollectible(collectible)}
          </CollectibleTypeIconOverlay>
        );
      }),
    [collectibles]
  );

  return (
    <styled.section display="flex" flexDirection="column" gap="space.04">
      <styled.div display="flex" alignItems="center" justifyContent="space-between">
        <styled.h2 textStyle="heading.04" margin="0">
          Collectibles
        </styled.h2>
        <styled.button
          type="button"
          px="space.02"
          py="space.01"
          onClick={() => {
            void refetch();
          }}
          disabled={isRefetching}
        >
          <ArrowRotateRightLeftIcon variant="small" />
        </styled.button>
      </styled.div>

      {isLoading ? (
        <styled.div display="flex" justifyContent="center" py="space.05">
          <Spinner />
        </styled.div>
      ) : null}

      {isError ? (
        <Callout variant="warning" title="Unable to load collectibles">
          Try refreshing to fetch the latest gallery.
        </Callout>
      ) : null}

      {!isLoading && !isError && collectibles.length === 0 ? (
        <styled.div
          border="default"
          borderRadius="sm"
          py="space.06"
          textAlign="center"
          color="ink.text-subdued"
        >
          No collectibles found for this account.
        </styled.div>
      ) : null}

      <styled.div
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(156px, 1fr))"
        gap="space.04"
      >
        {renderedCollectibles}
      </styled.div>
    </styled.section>
  );
}
