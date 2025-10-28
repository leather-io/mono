import { ErrorFallbackTab } from '@/components/error/error';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isInscriptionAsset } from '@leather.io/models';

import { useCollectibleHeight } from '../collectible';
import { CollectibleLoading } from '../components/collectible-loading';
import { InscriptionTokenDetails } from './inscription-token-details';

interface InscriptionDetailsProps {
  account: AccountId;
  assetId: string;
}
export function InscriptionDetails({ assetId, account }: InscriptionDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const height = useCollectibleHeight();

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);
  if (collectible.state === 'loading') {
    return <CollectibleLoading height={height} />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const asset = collectible.value?.[0];
    if (!asset || !isInscriptionAsset(asset)) {
      return <ErrorFallbackTab />;
    }
    return <InscriptionTokenDetails asset={asset} />;
  }

  return <ErrorFallbackTab />;
}
