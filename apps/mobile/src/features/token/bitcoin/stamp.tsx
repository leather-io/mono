import { imageUnavailableLabel } from '@/features/token/utils/image-unavailable-label';

import { StampAsset } from '@leather.io/models';
import { TokenDetailsProps } from '@leather.io/features';
import { CollectibleImage, ImageUnavailable } from '@/features/collectibles/components';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface StampProps {
  item: StampAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Stamp({ item, height, onPress }: StampProps) {
  if (!item.stampUrl) {
    return <ImageUnavailable height={height} message={imageUnavailableLabel} />;
  }
  return (
    <CollectibleImage
      src={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      imageUnavailableLabel={imageUnavailableLabel}
      onPress={onPress ? () => onPress({ assetId: serializeAssetId(getAssetId(item)) }) : undefined}
    />
  );
}
