import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';
import { ImageUnavailable } from './image-unavailable.web';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  thumbnailSrc?: string;
  onPress?(): void;
}

export function CollectibleHtml({
  src,
  height = 200,
  thumbnailSrc,
  onPress,
}: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !src;

  if (showFallback) {
    return <ImageUnavailable height={height} />;
  }

  const iframe = (
    <styled.iframe
      src={thumbnailSrc ?? src}
      height={height}
      width="100%"
      border="none"
      bg="transparent"
      pointerEvents={onPress ? 'none' : undefined}
      onError={() => setHasError(true)}
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
          {iframe}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{iframe}</CollectibleCard>;
}
