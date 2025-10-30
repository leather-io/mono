import { TokenDetailsProps } from '@/features/token/types';

import { StampAsset } from '@leather.io/models';
import { CollectibleImage } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { FallbackImage } from '../components/fallback';

interface StampProps {
  item: StampAsset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Stamp({ item, height, onPress }: StampProps) {
  if (!item.stampUrl) return <FallbackImage />;
  return (
    <CollectibleImage
      source={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      onPress={
        onPress
          ? () => onPress({ assetId: serializeAssetId(getAssetId(item)), assetProtocol: 'stamp' })
          : undefined
      }
    />
  );
}
