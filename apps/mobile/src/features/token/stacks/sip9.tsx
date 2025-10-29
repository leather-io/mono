import { TokenDetailsProps } from '@/features/token/types';
import { isBns } from '@/features/token/utils/is-bns';

import { Sip9Asset } from '@leather.io/models';
import { BnsImage, Sip9 as Sip9Component } from '@leather.io/ui/native';

import { FallbackImage } from '../components/fallback';

interface Sip9Props {
  item: Sip9Asset;
  height: number;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}
export function Sip9({ item, height, onPress }: Sip9Props) {
  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '')
    return <FallbackImage />;
  const collectionName = item?.collection?.name ?? '';

  // For SIP-9 items in the same collection have the same assetId and contractId
  // so we need to pass the tokenId to the onPress handler to distinguish between them
  const tokenId =
    item?.tokenId !== undefined && item?.tokenId !== null ? String(item.tokenId) : undefined;
  const onPressHandler = onPress
    ? () => onPress({ assetId: item.assetId, assetProtocol: 'sip9', tokenId })
    : undefined;

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
