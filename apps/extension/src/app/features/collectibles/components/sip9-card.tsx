import type { CollectibleKind } from '@leather.io/features';
import type { Sip9Asset } from '@leather.io/models';

import { BnsCard } from './bns';
import { ImageUnavailable } from './image-unavailable';
import { Sip9 } from './sip9';

interface Sip9CardProps {
  item: Sip9Asset;
  kind: CollectibleKind;
  onSelect?(asset: Sip9Asset): void;
}

export function Sip9Card({ item, kind, onSelect }: Sip9CardProps) {
  const onPressHandler = onSelect ? () => onSelect(item) : undefined;

  if (kind !== 'nft') {
    return <BnsCard name={item.name} isLegacy={kind === 'legacy-bns'} onPress={onPressHandler} />;
  }

  if (!item?.content?.contentUrl || item?.content?.contentUrl?.trim() === '') {
    return <ImageUnavailable />;
  }

  return <Sip9 item={item} onPress={onPressHandler} />;
}
