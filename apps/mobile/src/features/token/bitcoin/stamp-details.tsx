import { ErrorFallbackTab } from '@/components/error/error';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isStampAsset } from '@leather.io/models';

import { useCollectibleHeight } from '../collectible';
import { CollectibleLoading } from '../components/collectible-loading';
import { StampTokenDetails } from './stamp-token-details';

interface StampDetailsProps {
  account: AccountId;
  assetId: string;
}
export function StampDetails({ assetId, account }: StampDetailsProps) {
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
    const asset = collectible.value[0];
    if (!asset || !isStampAsset(asset)) {
      return <ErrorFallbackTab />;
    }
    return <StampTokenDetails asset={asset} />;
  }

  return <ErrorFallbackTab />;
}
