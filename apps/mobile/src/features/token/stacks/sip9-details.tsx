import { ErrorFallbackTab } from '@/components/error/error';
import { Sip9 } from '@/features/collectibles/components/sip9';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isSip9Asset } from '@leather.io/models';
import { assertExistence } from '@leather.io/utils';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface Sip9TokenDetailsProps {
  account: AccountId;
  assetId: string;
}
export function Sip9TokenDetails({ assetId, account }: Sip9TokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const height = useCollectibleHeight();

  const [sip9AssetId, tokenId] = assetId.split('|');
  assertExistence(sip9AssetId, 'SIP-9 Asset ID is required');
  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, sip9AssetId);

  if (collectible.state === 'loading') {
    return <TokenLoading />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const sip9Assets = collectible.value.filter(isSip9Asset);
    const asset = tokenId
      ? sip9Assets.find(candidate => candidate.tokenId?.toString() === tokenId)
      : sip9Assets[0];
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
