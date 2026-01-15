import { useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

interface CollectibleHtmlIframeProps {
  src: string;
  thumbnailSrc?: string;
  height: number;
  onPress?(): void;
  setHasError(): void;
}
function CollectibleHtmlIframe({
  src,
  thumbnailSrc,
  height,
  onPress,
  setHasError,
}: CollectibleHtmlIframeProps) {
  return (
    <styled.iframe
      src={thumbnailSrc ?? src}
      height={height}
      width="100%"
      border="none"
      bg="transparent"
      pointerEvents={onPress ? 'none' : undefined}
      onError={setHasError}
    />
  );
}

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
    <CollectibleHtmlIframe
      src={src}
      thumbnailSrc={thumbnailSrc}
      height={height}
      onPress={onPress}
      setHasError={() => setHasError(true)}
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
