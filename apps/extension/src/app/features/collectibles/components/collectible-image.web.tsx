import { useEffect, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';
import { ImageUnavailable } from './image-unavailable.web';

export interface CollectibleImageProps {
  alt?: string;
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
  isSvg?: boolean;
}

interface CollectibleImageContentProps {
  alt?: string;
  src: string;
  isSvg: boolean;
  onError(): void;
}

function CollectibleImageContent({ alt, src, isSvg, onError }: CollectibleImageContentProps) {
  return (
    <styled.img
      src={src}
      alt={alt}
      onError={onError}
      display="block"
      width="100%"
      height="100%"
      objectFit="cover"
      bg={isSvg ? 'ink.background-primary' : 'ink.background-secondary'}
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
