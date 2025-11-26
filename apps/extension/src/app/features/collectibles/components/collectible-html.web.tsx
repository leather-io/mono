import { useState } from 'react';

import { CollectibleCard } from './collectible-card.web';
import { ImageUnavailable } from './image-unavailable.web';

interface CollectibleHtmlProps {
  src: string;
  height?: number;
  thumbnailSrc?: string;
  onPress?: () => void;
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
    <iframe
      src={thumbnailSrc ?? src}
      height={height}
      width="100%"
      style={{
        border: 'none',
        background: 'transparent',
        pointerEvents: onPress ? 'none' : undefined,
      }}
      onError={() => setHasError(true)}
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
          {iframe}
        </button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{iframe}</CollectibleCard>;
}
