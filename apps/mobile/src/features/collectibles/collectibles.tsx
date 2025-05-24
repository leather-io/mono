import { FetchState, FetchWrapper } from '@/components/loading';
import { CollectiblesLayout } from '@/features/collectibles';

import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { SkeletonLoader } from '@leather.io/ui/native';

import { CollectiblesList } from './collectibles-list';

interface CollectiblesProps {
  collectibles: FetchState<NonFungibleCryptoAssetInfo[]>;
  mode?: 'widget' | 'gallery';
}

export function hasCollectibles(collectibles: FetchState<NonFungibleCryptoAssetInfo[]>) {
  return collectibles.state === 'success' && collectibles.value.length > 0;
}

export function Collectibles({ collectibles, mode = 'gallery' }: CollectiblesProps) {
  const thumbnailSize = mode === 'widget' ? 200 : 164;

  return (
    <FetchWrapper
      data={collectibles}
      loader={
        <CollectiblesLayout>
          <SkeletonLoader height={thumbnailSize} width={thumbnailSize} isLoading={true} />
          <SkeletonLoader height={thumbnailSize} width={thumbnailSize} isLoading={true} />
          <SkeletonLoader height={thumbnailSize} width={thumbnailSize} isLoading={true} />
          <SkeletonLoader height={thumbnailSize} width={thumbnailSize} isLoading={true} />
        </CollectiblesLayout>
      }
    >
      {mode === 'gallery' ? (
        <CollectiblesLayout>
          <CollectiblesList collectibles={collectibles} mode={mode} />
        </CollectiblesLayout>
      ) : (
        <CollectiblesList collectibles={collectibles} mode={mode} />
      )}
    </FetchWrapper>
  );
}
