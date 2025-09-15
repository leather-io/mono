import { TokenDetailsProps } from '@/features/token/types';
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
  Sip9,
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

interface StampProps {
  item: StampAsset;
  onPress?: () => void;
  height?: number;
}
export function Stamp({ item, onPress, height = 200 }: StampProps) {
  if (!item.stampUrl) return <FallbackImage />;
  return (
    <CollectibleImage
      source={item.stampUrl}
      alt={item.stamp.toString()}
      height={height}
      onPress={onPress}
    />
  );
}

function Bns({ name }: { name: string }) {
  return <BnsImage alt={name} height={200} />;
}
interface Sip9ComponentProps {
  item: Sip9Asset;
  onPress?(): void;
  height?: number;
}
export function Sip9Component({ item, onPress, height = 200 }: Sip9ComponentProps) {
  if (!item.cachedImage || item.cachedImage.trim() === '') return <FallbackImage />;
  return (
    <Sip9
      contentType={item.contentType as 'image/png' | 'image/jpeg' | 'video/mp4' | ''}
      name={item.name}
      height={height}
      src={item.cachedImage}
      onPress={onPress}
    />
  );
}
interface InscriptionComponentProps {
  item: InscriptionAsset;
  onPress?: () => void;
  height?: number;
}
export function InscriptionComponent({ item, onPress, height = 200 }: InscriptionComponentProps) {
  if (!item.src || item.src.trim() === '') return <FallbackImage />;
  return (
    <Inscription
      name={item.title}
      mimeType={item.mimeType}
      height={height}
      src={item.src}
      onPress={onPress}
    />
  );
}

function isBns(item: NonFungibleCryptoAsset) {
  return 'collection' in item && item.collection.name === 'bns';
}

export function renderCollectible({
  item,
  onPress,
}: {
  item: NonFungibleCryptoAsset;
  onPress?: (tokenDetails: TokenDetailsProps) => void;
}) {
  console.log('renderCollectible', item);
  switch (item.protocol) {
    case 'stamp':
      return (
        <Stamp
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.stamp.toString(),
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
        />
      );
    case 'sip9':
      return isBns(item) ? (
        <Bns name={item.name} />
      ) : (
        <Sip9Component
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.name,
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
        />
      );
    case 'inscription':
      return (
        <InscriptionComponent
          item={item}
          onPress={
            onPress
              ? () =>
                  onPress?.({
                    assetId: item.id,
                    assetProtocol: item.protocol,
                  })
              : undefined
          }
        />
      );
    default:
      return assertUnreachable(item);
  }
}
