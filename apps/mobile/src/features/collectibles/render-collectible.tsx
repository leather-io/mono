import { t } from '@lingui/core/macro';

import { CryptoAssetProtocol, NonFungibleCryptoAsset } from '@leather.io/models';
import { CollectibleCard, ImageUnavailable, Text } from '@leather.io/ui/native';

import { serializeCollectible } from './collectibles-serializer';

export function renderCollectible({ item }: { item: NonFungibleCryptoAsset }) {
  const collectible = serializeCollectible(item);
  if (!collectible) return null;

  if (!collectible.src)
    return (
      <ImageUnavailable>
        <Text textAlign="center">{t`Image currently unavailable`}</Text>
      </ImageUnavailable>
    );
  return (
    <CollectibleCard
      name={collectible.name}
      type={collectible.type as CryptoAssetProtocol}
      mimeType={collectible.mimeType}
      height={200}
      src={collectible.src}
    />
  );
}
