import { TokenDetailsProps } from '@/features/token/types';

import { Sip9Asset } from '@leather.io/models';
import { BnsImage, Sip9 as Sip9Component } from '@leather.io/ui/native';

import { isBns } from '@/features/token/utils/is-bns';
import { FallbackImage } from './fallback';

interface Sip9Props {
  item: Sip9Asset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Sip9({ item, height, onPress }: Sip9Props) {
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '')
    return <FallbackImage />;
  const collectionName = item?.collection?.name ?? '';

  const onPressHandler = onPress ? () => onPress({ assetId: item.assetId, assetProtocol: 'sip9' }) : undefined;

  if (isBns(collectionName)) {
    return <BnsImage source={item.content.contentUrl} alt={item.name} height={height} onPress={onPressHandler} />;
  }
  return (
    <Sip9Component
      item={item}
      height={height}
      onPress={
        onPressHandler
      }
    />
  );
}
