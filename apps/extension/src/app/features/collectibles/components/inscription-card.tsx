import type { InscriptionAsset } from '@leather.io/models';

import { useGetInscriptionTextContentQuery } from '@app/query/bitcoin/ordinals/inscription-text-content.query';

import { ImageUnavailable } from './image-unavailable';
import { Inscription as InscriptionComponent } from './inscription';

interface InscriptionCardProps {
  item: InscriptionAsset;
  onSelect?(asset: InscriptionAsset): void;
}

interface TextInscriptionCardProps {
  item: InscriptionAsset;
  onPress?(): void;
}

function TextInscriptionCard({ item, onPress }: TextInscriptionCardProps) {
  const { data, isLoading } = useGetInscriptionTextContentQuery(item.src);

  return (
    <InscriptionComponent
      name={item.title}
      mimeType={item.mimeType}
      src={isLoading ? '' : data || item.src}
      thumbnailSrc={item.thumbnailSrc}
      onPress={onPress}
    />
  );
}

export function InscriptionCard({ item, onSelect }: InscriptionCardProps) {
  const { mimeType, src, title, thumbnailSrc } = item;
  const onPress = onSelect ? () => onSelect(item) : undefined;

  if (!src || src.trim() === '') {
    return <ImageUnavailable />;
  }

  if (mimeType === 'text') {
    return <TextInscriptionCard item={item} onPress={onPress} />;
  }

  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      src={src}
      thumbnailSrc={thumbnailSrc}
      onPress={onPress}
    />
  );
}
