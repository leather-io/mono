import { useState } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { Iframe } from '@app/ui/components/iframe';

import { CollectibleCard } from './collectible-card';
import { ImageUnavailable } from './image-unavailable';

interface CollectibleHtmlProps {
  src: string;
  thumbnailSrc?: string;
  onPress?(): void;
}

function HtmlInscriptionPreview({ src, onError }: { src: string; onError?(): void }) {
  return (
    <Box width="100%" height="100%" overflow="hidden" bg="ink.background-secondary">
      <Iframe src={src} width="100%" height="100%" border="none" onError={onError} />
    </Box>
  );
}

export function CollectibleHtml({ src, onPress }: CollectibleHtmlProps) {
  const [hasError, setHasError] = useState(false);

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
          <HtmlInscriptionPreview src={src} onError={() => setHasError(true)} />
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <HtmlInscriptionPreview src={src} onError={() => setHasError(true)} />
    </CollectibleCard>
  );
}
