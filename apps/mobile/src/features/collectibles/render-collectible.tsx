import { t } from '@lingui/core/macro';

import {
  InscriptionAsset,
  NonFungibleCryptoAsset,
  Sip9Asset,
  StampAsset,
} from '@leather.io/models';
import {
  BnsImage,
  CollectibleImage,
  ImageUnavailable,
  Inscription,
  Text,
} from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

function FallbackImage() {
  return (
    <ImageUnavailable>
      <Text textAlign="center">{t`Image currently unavailable`}</Text>
    </ImageUnavailable>
  );
}

function Stamp({ item }: { item: StampAsset }) {
  if (!item.stampUrl) return <FallbackImage />;
  return <CollectibleImage source={item.stampUrl} alt={item.stamp.toString()} height={200} />;
}

function Bns({ name }: { name: string }) {
  return <BnsImage alt={name} height={200} />;
}

function Sip9({ item }: { item: Sip9Asset }) {
  if (!item.cachedImage) return <FallbackImage />;
  return <CollectibleImage source={item.cachedImage} alt={item.name} height={200} />;
}

function InscriptionComponent({ item }: { item: InscriptionAsset }) {
  if (!item.src) return <FallbackImage />;
  return <Inscription name={item.title} mimeType={item.mimeType} height={200} src={item.src} />;
}

function isBns(item: NonFungibleCryptoAsset) {
  return 'collection' in item && item.collection === 'bns';
}

export function renderCollectible({ item }: { item: NonFungibleCryptoAsset }) {
  switch (item.protocol) {
    case 'stamp':
      return <Stamp item={item} />;
    case 'sip9':
      return isBns(item) ? <Bns name={item.name} /> : <Sip9 item={item} />;
    case 'inscription':
      return <InscriptionComponent item={item} />;
    default:
      return assertUnreachable(item);
  }
}
