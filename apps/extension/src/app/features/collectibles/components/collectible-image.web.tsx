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

  const content = (
    <styled.img
      src={thumbnailSrc ?? src}
      alt={alt}
      onError={() => setHasError(true)}
      display="block"
      width="100%"
      height="100%"
      objectFit="cover"
      bg={isSvg ? 'ink.background-primary' : 'ink.background-secondary'}
    />
  );

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
          {content}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard>{content}</CollectibleCard>;
}
