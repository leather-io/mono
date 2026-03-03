import { useEffect, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

export interface CollectibleImageProps {
  alt?: string;
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
  isSvg?: boolean;
}

const pixelatedImageThreshold = 40;

interface CollectibleImageContentProps {
  alt?: string;
  src: string;
  isSvg: boolean;
  onError(): void;
}

function CollectibleImageContent({ alt, src, isSvg, onError }: CollectibleImageContentProps) {
  const [naturalWidth, setNaturalWidth] = useState(0);

  return (
    <styled.img
      src={src}
      alt={alt}
      loading="lazy"
      onError={onError}
      onLoad={e => setNaturalWidth((e.target as HTMLImageElement).naturalWidth)}
      display="block"
      width="100%"
      height="100%"
      objectFit="cover"
      bg={isSvg ? 'ink.background-primary' : 'ink.background-secondary'}
      style={{
        imageRendering: naturalWidth <= pixelatedImageThreshold ? 'pixelated' : 'auto',
      }}
    />
  );
}

export function CollectibleImage({
  alt,
  src,
  thumbnailSrc,
  onPress,
  isSvg = false,
}: CollectibleImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (!src || hasError) {
    return <ImageUnavailable />;
  }

  if (onPress) {
    return (
      <CollectibleCard>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          height="100%"
        >
          <CollectibleImageContent
            alt={alt}
            src={thumbnailSrc ?? src}
            isSvg={isSvg}
            onError={() => setHasError(true)}
          />
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <CollectibleImageContent
        alt={alt}
        src={thumbnailSrc ?? src}
        isSvg={isSvg}
        onError={() => setHasError(true)}
      />
    </CollectibleCard>
  );
}
