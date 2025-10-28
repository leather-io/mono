import { ErrorFallbackTab } from '@/components/error/error';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isSip9Asset } from '@leather.io/models';

import { useCollectibleHeight } from '../collectible';
import { CollectibleLoading } from '../components/collectible-loading';
import { isBns } from '../utils/is-bns';
import { BnsTokenDetails } from './bns-token-details';
import { Sip9TokenDetails as Sip9TokenDetailsComponent } from './sip9-token-details';
interface Sip9TokenDetailsProps {
  account: AccountId;
  assetId: string;
  tokenId?: string;
}
export function Sip9TokenDetails({ assetId, tokenId, account }: Sip9TokenDetailsProps) {
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
    const sip9Assets = collectible.value.filter(isSip9Asset);
    const asset = tokenId
      ? sip9Assets.find(candidate => candidate.tokenId?.toString() === tokenId)
      : sip9Assets[0];
    if (!asset) {
      return <ErrorFallbackTab />;
    }

   if(isBns(asset?.collection?.name ?? '')){
    return <BnsTokenDetails asset={asset} />;
   }

   return <Sip9TokenDetailsComponent asset={asset} />;
  }

  return <ErrorFallbackTab />;
}
