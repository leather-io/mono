import { useNavigate } from 'react-router';

import { Box } from 'leather-styles/jsx';

import type { AccountAddresses, CryptoAssetProtocol } from '@leather.io/models';
import { Callout } from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { useAccountCollectibles } from '@app/query/collectibles/account-collectibles.query';

import { CollectibleDetailsLoading } from './collectible-details-loading';
import { Sip9DetailsPage } from './sip9-details-page';

interface CollectibleDetailsProps {
  account: AccountAddresses;
  assetId: SerializedCryptoAssetId;
  protocol: CryptoAssetProtocol;
}

export function CollectibleDetails({ account, assetId, protocol }: CollectibleDetailsProps) {
  const navigate = useNavigate();
  const { data: collectibles = [], isLoading, isError } = useAccountCollectibles(account);

  function handleBack() {
    void navigate(-1);
  }

  if (isLoading) {
    return <CollectibleDetailsLoading onBack={handleBack} />;
  }

  if (isError) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="warning" title="Unable to load collectible details">
          Try again in a few moments.
        </Callout>
      </Box>
    );
  }

  const view = collectibles.find(item => item.key === assetId);

  if (!view) {
    return (
      <Box px="space.05" py="space.05">
        <Callout variant="info" title="Collectible not found">
          This collectible is not available for this account.
        </Callout>
      </Box>
    );
  }

  if (protocol === 'sip9') {
    return <Sip9DetailsPage view={view} onBack={handleBack} />;
  }

  return null;
}
