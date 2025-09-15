import { ErrorFallbackTab } from '@/components/error/error';
import { Sip9Component } from '@/features/collectibles/render-collectible';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, Sip9Asset } from '@leather.io/models';

import { Collectible } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface Sip9TokenDetailsProps {
  account: AccountId;
  assetId: string;
}
export function Sip9TokenDetails({ assetId, account }: Sip9TokenDetailsProps) {
  const { fingerprint, accountIndex } = account;

  const collectible = useAccountCollectibleByAssetId(fingerprint, accountIndex, assetId);

  console.log('SIP9 collectible', collectible);
  if (collectible.state === 'loading') {
    return <TokenLoading />;
  }
  if (collectible.state === 'error') {
    return <ErrorFallbackTab />;
  }
  if (collectible.state === 'success' && collectible.value.length > 0) {
    const { name, description, collection } = collectible.value?.[0] as Sip9Asset;
    return (
      <Collectible
        collectible={collectible.value[0]!}
        name={name}
        description={description}
        collection="collection.name"
      >
        <Sip9Component item={collectible.value[0]! as Sip9Asset} height={342} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}
