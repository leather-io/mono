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
  console.log('Sip9 item', item);
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '') {
    return <ImageUnavailable height={height} />;
  }
  const onPressHandler = onSelect ? () => onSelect(item) : undefined;

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

  return <Sip9 item={item} height={height} onPress={onPressHandler} />;
}
