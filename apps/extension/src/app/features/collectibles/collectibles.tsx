import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { styled } from 'leather-styles/jsx';

import type { TokenDetailsProps } from '@leather.io/features';
import type { CollectibleView } from '@leather.io/features';
import { ArrowRotateRightLeftIcon, Callout, Spinner } from '@leather.io/ui';

import type { SerializedCryptoAssetId } from '@leather.io/utils';
import { RouteUrls } from '@shared/route-urls';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';
import { useAccountAddresses } from '@app/services/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { CollectibleTypeIconOverlay } from './components/collectible-type-icon-overlay.web';
import { InscriptionCard } from './components/inscription-card';
import { Sip9Card } from './components/sip9-card';
import { StampCard } from './components/stamp-card';

const CARD_HEIGHT = 184;

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

  switch (view.protocol) {
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

export function Collectibles() {
  const navigate = useNavigate();
  const accountIndex = useCurrentAccountIndex();
  const account = useAccountAddresses(accountIndex);
  const {
    data: collectibles = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAccountCollectibles(account);

  function handleOpenToken({ assetId }: TokenDetailsProps) {
    navigate(RouteUrls.TokenDetails.replace(':assetId', assetId));
  }

  const renderedCollectibles = useMemo(
    () =>
      collectibles.map(view => (
        <CollectibleTypeIconOverlay protocol={view.protocol} key={view.key}>
          {renderCollectible(view, handleOpenToken)}
        </CollectibleTypeIconOverlay>
      )),
    [collectibles, handleOpenToken]
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
