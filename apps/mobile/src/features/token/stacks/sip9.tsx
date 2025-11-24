import { TokenDetailsProps } from '@/features/token/types';
import { imageUnavailableLabel } from '@/features/token/utils/image-unavailable-label';

import { Sip9Asset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';
import { BnsImage, ImageUnavailable, Sip9 as Sip9Component } from '@leather.io/ui/native';
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
  if (assetName === 'BNS-V2') {
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
