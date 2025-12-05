import type { StampAsset } from '@leather.io/models';

import { CollectibleImage } from './collectible-image.web';
import { ImageUnavailable } from './image-unavailable.web';

interface StampCardProps {
  item: StampAsset;
  height: number;
  onSelect?(asset: StampAsset): void;
}

export function StampCard({ item, height, onSelect }: StampCardProps) {
  if (!item.stampUrl) {
    return <ImageUnavailable height={height} />;
  }
  return (
    <CollectibleImage
      src={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      onPress={onSelect ? () => onSelect(item) : undefined}
    />
  );
}
