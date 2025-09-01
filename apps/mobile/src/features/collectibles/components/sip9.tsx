import { Sip9Asset } from '@leather.io/models';
import { BnsImage, CollectibleImage } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';

function isBns(name: string): boolean {
  return name === 'BNS: Bitcoin Name System' || name === 'BNS: Bitcoin Name System (V2)';
}
interface Sip9Props {
  item: Sip9Asset;
  height: number;
}
export function Sip9({ item, height }: Sip9Props) {
  if (!item.cachedImage || item.cachedImage.trim() === '') return <FallbackImage />;

  if (isBns(item.collection.name)) {
    return <BnsImage alt={item.name} height={height} />;
  }
  return <CollectibleImage source={item.cachedImage} alt={item.name} height={height} />;
}
