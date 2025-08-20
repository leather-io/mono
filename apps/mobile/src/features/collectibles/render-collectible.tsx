import { NonFungibleCryptoAsset } from '@leather.io/models';
import { CollectibleCard } from '@leather.io/ui/native';

import { serializeCollectible } from './collectibles-serializer';

export function renderCollectible({ item }: { item: NonFungibleCryptoAsset }) {
  const collectible = serializeCollectible(item);
  const thumbnailSize = 200;
  if (!collectible) return null;
  return (
    <CollectibleCard
      name={collectible.name}
      type={collectible.type}
      mimeType={collectible.mimeType}
      size={thumbnailSize}
      src={collectible.src}
    />
  );
}
