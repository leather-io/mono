import type { StampAsset } from '@leather.io/models';

import { CollectibleImage } from './collectible-image';
import { ImageUnavailable } from './image-unavailable';

interface StampCardProps {
  item: StampAsset;
  onSelect?(asset: StampAsset): void;
}

export function StampCard({ item, onSelect }: StampCardProps) {
  if (!item.stampUrl) {
    return <ImageUnavailable />;
  }
  return (
    <CollectibleImage
      src={item.stampUrl}
      alt={item.stamp.toString()}
      onPress={onSelect ? () => onSelect(item) : undefined}
    />
  );
}
