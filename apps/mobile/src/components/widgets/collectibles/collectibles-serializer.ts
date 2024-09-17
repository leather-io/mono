import { type Collectible, type CollectibleCardProps } from '@leather.io/ui/native';

export function serializeCollectibles(collectibles: Collectible[]): CollectibleCardProps[] {
  return collectibles.map(collectible => {
    const isOrdinal = 'name' in collectible && 'mimeType' in collectible;
    if (isOrdinal) {
      return {
        type: 'inscription',
        name: collectible.title,
        src: collectible.src,
        mimeType: collectible.mimeType,
      };
    }
    return {
      type: 'stacks',
      name: collectible.metadata.name,
      src: collectible.metadata.cached_image,
      mimeType: null,
    };
  });
}
