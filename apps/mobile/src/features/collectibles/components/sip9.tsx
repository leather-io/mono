import { TokenDetailsProps } from '@/features/token/types';

import { Sip9Asset } from '@leather.io/models';
import { BnsImage, Sip9 as Sip9Component } from '@leather.io/ui/native';
import { createSip9AssetId } from '@leather.io/utils';

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
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '')
    return <FallbackImage />;
  const collectionName = item?.collection?.name ?? '';

  // SIP-9 items in the same collection have the same assetId and contractId so we need to construct the assetId
  const { id: assetId, protocol: assetProtocol } = createSip9AssetId(item);
  const onPressHandler = onPress ? () => onPress({ assetId, assetProtocol }) : undefined;

  if (isBns(collectionName)) {
    return (
      <BnsImage
        source={encodeURI(item.content.contentUrl)}
        alt={item.name}
        height={height}
        onPress={onPressHandler}
      />
    );
  }
  return <Sip9Component item={item} height={height} onPress={onPressHandler} />;
}
