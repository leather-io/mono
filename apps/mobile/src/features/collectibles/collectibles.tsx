import { FetchState, FetchWrapper } from '@/components/loading';
import { CollectiblesLayout, serializeCollectibles } from '@/features/collectibles';

import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { CollectibleCard, SkeletonLoader } from '@leather.io/ui/native';

interface CollectiblesProps {
  collectibles: FetchState<NonFungibleCryptoAssetInfo[]>;
  mode?: 'widget' | 'gallery';
}

export function hasCollectibles(collectibles: FetchState<NonFungibleCryptoAssetInfo[]>) {
  return collectibles.state === 'success' && collectibles.value.length > 0;
}

export function Collectibles({ collectibles, mode = 'gallery' }: CollectiblesProps) {
  const displayLimit = 9;
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
      {collectibles.state === 'success' &&
        serializeCollectibles(collectibles.value).map(
          ({ name, type, mimeType, subtitle, src }, index) => {
            if (mode === 'widget' && index >= displayLimit) return null;
            return (
              <CollectibleCard
                key={index}
                name={name}
                type={type}
                mimeType={mimeType}
                mode={mode}
                size={thumbnailSize}
                src={src}
                subtitle={subtitle}
              />
            );
          }
        )}
    </FetchWrapper>
  );
}
