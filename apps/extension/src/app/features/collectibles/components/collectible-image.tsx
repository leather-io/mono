import { useEffect, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

export interface CollectibleImageProps {
  alt?: string;
  src: string;
  height?: number;
  thumbnailSrc?: string;
  onPress?(): void;
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
    <styled.img
      src={thumbnailSrc ?? src}
      alt={alt}
      onError={() => setHasError(true)}
      display="block"
      width="100%"
      height={height}
      objectFit="contain"
      bg={isSvg ? 'ink.background-primary' : undefined}
    />
  );

  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
        >
          {content}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{content}</CollectibleCard>;
}
