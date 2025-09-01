import { StampAsset } from '@leather.io/models';
import { CollectibleImage } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';

interface StampProps {
  item: StampAsset;
  height: number;
}
export function Stamp({ item, height }: StampProps) {
  if (!item.stampUrl) return <FallbackImage />;
  return <CollectibleImage source={item.stampUrl} alt={item.stamp.toString()} height={height} />;
}
