import { useEffect, useState } from 'react';

import type { InscriptionAsset } from '@leather.io/models';

import { ImageUnavailable } from './image-unavailable.web';
import { Inscription as InscriptionComponent } from './inscription.web';

interface InscriptionCardProps {
  item: InscriptionAsset;
  height: number;
  onSelect?(asset: InscriptionAsset): void;
}

export function InscriptionCard({ item, height, onSelect }: InscriptionCardProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { mimeType, src, title, thumbnailSrc } = item;

  useEffect(() => {
    if (mimeType === 'text' && src) {
      setIsLoading(true);
      void fetch(src)
        .then(response => response.text())
        .then(text => setContent(text))
        .catch(() => setContent('Content not found'))
        .finally(() => setIsLoading(false));
    }
  }, [mimeType, src]);

  if (!src || src.trim() === '') {
    return <ImageUnavailable height={height} />;
  }

  return (
    <InscriptionComponent
      name={title}
      mimeType={mimeType}
      height={height}
      src={isLoading ? '' : content || src}
      thumbnailSrc={thumbnailSrc}
      onPress={onSelect ? () => onSelect(item) : undefined}
    />
  );
}
