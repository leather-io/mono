import { CollectibleImage, ImageUnavailable } from '@/features/collectibles';
import { TokenDetailsProps } from '@/features/token/types';

import { StampAsset } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface StampProps {
  item: StampAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Stamp({ item, height, onPress }: StampProps) {
  if (!item.stampUrl) {
    return <ImageUnavailable height={height} />;
  }
  return (
    <CollectibleImage
      src={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      onPress={onPress ? () => onPress({ assetId: serializeAssetId(getAssetId(item)) }) : undefined}
    />
  );
}
