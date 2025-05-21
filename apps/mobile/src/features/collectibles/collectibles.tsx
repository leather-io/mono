import { FetchState, FetchWrapper } from '@/components/loading';
import { CollectiblesLayout, serializeCollectibles } from '@/features/collectibles';

import { NonFungibleCryptoAssetInfo } from '@leather.io/models';
import { Box, CollectibleCard, SkeletonLoader } from '@leather.io/ui/native';

interface CollectiblesProps {
  collectibles: FetchState<NonFungibleCryptoAssetInfo[]>;
  mode?: 'widget' | 'gallery';
}

export function hasCollectibles(collectibles: FetchState<NonFungibleCryptoAssetInfo[]>) {
  return collectibles.state === 'success' && collectibles.value.length > 0;
}

export function Collectibles({ collectibles, mode = 'gallery' }: CollectiblesProps) {
  const displayLimit = mode === 'widget' ? 9 : undefined;
  const thumbnailSize = mode === 'widget' ? 200 : 164;

  const Wrapper = mode === 'widget' ? Box : CollectiblesLayout;

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
      {collectibles.state === 'success' && (
        <Wrapper>
          {serializeCollectibles(collectibles.value)
            .slice(0, displayLimit)
            .map(({ name, type, mimeType, subtitle, src }, index) => (
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
            ))}
        </Wrapper>
      )}
    </FetchWrapper>
  );
}
