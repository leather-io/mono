import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';
import { ImageUnavailable } from './image-unavailable.web';

interface CollectibleHtmlProps {
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
}

export function CollectibleHtml({ src, thumbnailSrc, onPress }: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = hasError || !src;

  if (showFallback) {
    return <ImageUnavailable />;
  }

  const iframe = (
    <styled.iframe
      src={thumbnailSrc ?? src}
      width="100%"
      height="100%"
      border="none"
      bg="transparent"
      pointerEvents={onPress ? 'none' : undefined}
      onError={() => setHasError(true)}
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
          {iframe}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard>{iframe}</CollectibleCard>;
}
