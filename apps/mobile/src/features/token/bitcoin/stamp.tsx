import { TokenDetailsProps } from '@/features/token/types';
import { getImageUnavailableLabel } from '@/features/token/utils/image-unavailable-label';

import { StampAsset } from '@leather.io/models';
import { CollectibleImage, ImageUnavailable } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface StampProps {
  item: StampAsset;
  height: number;
  onPress?(tokenDetails: TokenDetailsProps): void;
}
export function Stamp({ item, height, onPress }: StampProps) {
  if (!item.stampUrl) {
    return <ImageUnavailable height={height} message={getImageUnavailableLabel()} />;
  }
  return (
    <CollectibleImage
      src={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      imageUnavailableLabel={getImageUnavailableLabel()}
      onPress={onPress ? () => onPress({ assetId: serializeAssetId(getAssetId(item)) }) : undefined}
    />
  );
}
