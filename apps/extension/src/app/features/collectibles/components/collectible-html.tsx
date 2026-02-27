import { useEffect, useState } from 'react';

import { styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

interface CollectibleHtmlProps {
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
}

interface HtmlInscriptionImageProps {
  src: string;
  onError(): void;
}

function HtmlInscriptionImage({ src, onError }: HtmlInscriptionImageProps) {
  return (
    <styled.img
      src={src}
      alt="HTML inscription"
      onError={onError}
      display="block"
      width="100%"
      height="100%"
      objectFit="cover"
      bg="ink.background-secondary"
    />
  );
}

export function CollectibleHtml({ src, thumbnailSrc, onPress }: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);
  const imgSrc = thumbnailSrc ?? src;

  useEffect(() => {
    setHasError(!imgSrc);
  }, [imgSrc]);

  if (!imgSrc || hasError) {
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
          <HtmlInscriptionImage src={imgSrc} onError={() => setHasError(true)} />
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <HtmlInscriptionImage src={imgSrc} onError={() => setHasError(true)} />
    </CollectibleCard>
  );
}
