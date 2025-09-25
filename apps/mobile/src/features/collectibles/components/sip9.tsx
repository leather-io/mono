import { TokenDetailsProps } from '@/features/token/types';

import { Sip9Asset } from '@leather.io/models';
import { BnsImage, Sip9 as Sip9Component } from '@leather.io/ui/native';

import { FallbackImage } from './fallback';

function isBns(name: string): boolean {
  return name === 'BNS: Bitcoin Name System' || name === 'BNS: Bitcoin Name System (V2)';
}
interface Sip9Props {
  item: Sip9Asset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Sip9({ item, height, onPress }: Sip9Props) {
  if (!item.cachedImage || item.cachedImage.trim() === '') return <FallbackImage />;

  if (isBns(item.collection.name)) {
    return <BnsImage source={item.cachedImage} alt={item.name} height={height} />;
  }
  return (
    <Sip9Component
      item={item}
      height={height}
      onPress={
        onPress ? () => onPress({ assetId: item.assetId, assetProtocol: 'sip9' }) : undefined
      }
    />
  );
}
