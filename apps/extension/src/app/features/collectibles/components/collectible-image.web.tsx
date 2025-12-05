import { useEffect, useState } from 'react';

import { CollectibleCard } from './collectible-card.web';
import { ImageUnavailable } from './image-unavailable.web';

export interface CollectibleImageProps {
  alt?: string;
  src: string;
  height?: number;
  thumbnailSrc?: string;
  onPress?: () => void;
  isSvg?: boolean;
}

export function CollectibleImage({
  alt,
  src,
  height = 200,
  thumbnailSrc,
  onPress,
  isSvg = false,
}: CollectibleImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (!src || hasError) {
    return <ImageUnavailable height={height} />;
  }

  const content = (
    <img
      src={thumbnailSrc ?? src}
      alt={alt}
      onError={() => setHasError(true)}
      style={{
        display: 'block',
        width: '100%',
        height,
        objectFit: 'contain',
        backgroundColor: isSvg ? 'var(--colors-ink-background-primary)' : undefined,
      }}
    />
  );

  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <button
          type="button"
          onClick={onPress}
          style={{ border: 0, padding: 0, margin: 0, background: 'transparent', width: '100%' }}
        >
          {content}
        </button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{content}</CollectibleCard>;
}

