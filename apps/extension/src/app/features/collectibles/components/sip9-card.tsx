import type { Sip9Asset } from '@leather.io/models';
import { getStacksContractAssetName } from '@leather.io/stacks';

import { BnsImage } from './bns.web';
import { ImageUnavailable } from './image-unavailable.web';
import { Sip9 } from './sip9.web';

interface Sip9CardProps {
  item: Sip9Asset;
  height: number;
  onSelect?(asset: Sip9Asset): void;
}

export function Sip9Card({ item, height, onSelect }: Sip9CardProps) {
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '') {
    return <ImageUnavailable height={height} />;
  }
  const onPressHandler = onSelect ? () => onSelect(item) : undefined;

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

  return <Sip9 item={item} height={height} onPress={onPressHandler} />;
}

