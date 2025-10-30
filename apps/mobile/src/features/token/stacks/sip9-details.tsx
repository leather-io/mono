import { ErrorFallbackTab } from '@/components/error/error';
import { Sip9 } from '@/features/token/stacks/sip9';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isSip9Asset } from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface Sip9TokenDetailsProps {
  account: AccountId;
  assetId: SerializedCryptoAssetId;
}
export function Sip9TokenDetails({ assetId, account }: Sip9TokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const height = useCollectibleHeight();

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);

  if (collectible.state === 'loading') {
    return <TokenLoading />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const asset = collectible.value.find(isSip9Asset);
    if (!asset) {
      return <ErrorFallbackTab />;
    }
    const { name, description } = asset;
    return (
      <Collectible name={name} description={description} details={asset}>
        <Sip9 item={asset} height={height} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}
