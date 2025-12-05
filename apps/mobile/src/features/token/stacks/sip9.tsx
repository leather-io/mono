import {
  BnsImage,
  ImageUnavailable,
  Sip9 as Sip9Component,
} from '@/features/collectibles/components';
import { TokenDetailsProps } from '@/features/token/types';
import { imageUnavailableLabel } from '@/features/token/utils/image-unavailable-label';

import { Sip9Asset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

interface Sip9Props {
  item: Sip9Asset;
  height: number;
  onPress?(tokenDetails: TokenDetailsProps): void;
}
export function Sip9({ item, height, onPress }: Sip9Props) {
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '') {
    return <ImageUnavailable height={height} message={imageUnavailableLabel} />;
  }
  const onPressHandler = onPress
    ? () => onPress({ assetId: serializeAssetId(getAssetId(item)) })
    : undefined;

  const assetName = getStacksContractAssetName(item.assetId);
  const isBns =
    item.assetId.toLowerCase().endsWith('.bns::names') || assetName?.toUpperCase() === 'BNS-V2';
  if (isBns) {
    return (
      <BnsImage
        src={encodeURI(item.content.contentUrl)}
        alt={item.name}
        height={height}
        onPress={onPressHandler}
      />
    );
  }
  return (
    <Sip9Component
      item={item}
      height={height}
      onPress={onPressHandler}
      imageUnavailableLabel={imageUnavailableLabel}
    />
  );
}
