import { ErrorFallbackTab } from '@/components/error/error';
import { InscriptionComponent } from '@/features/collectibles/render-collectible';
import { useAccountCollectibleByAssetId } from '@/queries/collectibles/account-collectibles.query';

import { AccountId, InscriptionAsset } from '@leather.io/models';

import { Collectible } from '../collectible';
import { TokenLoading } from '../components/token-loading';

interface InscriptionDetailsProps {
  account: AccountId;
  assetId: string;
}
export function InscriptionDetails({ assetId, account }: InscriptionDetailsProps) {
  const { fingerprint, accountIndex } = account;

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
      <Collectible collectible={collectible.value[0]!} name={title} description={title}>
        <InscriptionComponent item={collectible.value[0]! as InscriptionAsset} height={342} />
      </Collectible>
    );
  }

  return <ErrorFallbackTab />;
}
