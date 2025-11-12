import { ErrorFallbackTab } from '@/components/error/error';
import { Stamp } from '@/features/token/bitcoin/stamp';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isStampAsset } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface StampDetailsProps {
  account: AccountId;
  assetId: SerializedCryptoAssetId;
}
export function StampDetails({ assetId, account }: StampDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const height = useCollectibleHeight();

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);

  if (collectible.state === 'loading') {
    return <TokenLoading variant="collectible" />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const asset = collectible.value[0];
    if (!asset || !isStampAsset(asset)) {
      return <ErrorFallbackTab />;
    }
    return <Stamp item={asset} height={height} />;
  }

  return <ErrorFallbackTab />;
}
