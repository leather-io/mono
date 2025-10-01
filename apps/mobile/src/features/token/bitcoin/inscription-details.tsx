import { ErrorFallbackTab } from '@/components/error/error';
import { Inscription } from '@/features/collectibles/components/inscription';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, InscriptionAsset } from '@leather.io/models';

import { Collectible, useCollectibleHeight } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface InscriptionDetailsProps {
  account: AccountId;
  assetId: string;
}
export function InscriptionDetails({ assetId, account }: InscriptionDetailsProps) {
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
    const { title } = collectible.value?.[0] as InscriptionAsset;
    return (
      <Collectible
        name={title}
        description={title}
        details={collectible.value[0]! as InscriptionAsset}
      >
        <Inscription item={collectible.value[0]! as InscriptionAsset} height={height} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}
