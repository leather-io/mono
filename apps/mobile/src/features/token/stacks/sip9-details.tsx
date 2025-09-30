import { ErrorFallbackTab } from '@/components/error/error';
import { Sip9 } from '@/features/collectibles/components/sip9';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, Sip9Asset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface Sip9TokenDetailsProps {
  account: AccountId;
  assetId: string;
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
    const { name, description, details } = collectible.value?.[0] as Sip9Asset;
    return (
      <Collectible
        name={name}
        description={description}
        collection={details.collection ?? undefined}
      >
        <Sip9 item={collectible.value[0]! as Sip9Asset} height={height} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}
