import { ErrorFallbackTab } from '@/components/error/error';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, isSip9Asset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import { TokenLoading } from '../components/token-loading';
import { BnsDetails } from './bns-details';
import { Sip9TokenDetails } from './sip9-token-details';

interface Sip9DetailsProps {
  account: AccountId;
  assetId: SerializedCryptoAssetId;
}
export function Sip9Details({ assetId, account }: Sip9DetailsProps) {
  const { fingerprint, accountIndex } = account;

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);

  if (collectible.state === 'loading') {
    return <TokenLoading variant="collectible" />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const view = collectible.value.find(item => isSip9Asset(item.asset));
    const asset = view?.asset;
    if (!asset || !isSip9Asset(asset)) {
      return <ErrorFallbackTab />;
    }
    const assetName = getStacksContractAssetName(asset.assetId);
    if (assetName === 'BNS-V2') {
      return <BnsDetails asset={asset} />;
    }
    return <Sip9TokenDetails asset={asset} />;
  }

  return <ErrorFallbackTab />;
}
