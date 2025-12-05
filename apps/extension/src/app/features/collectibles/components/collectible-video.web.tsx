import { Box, styled } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card.web';

interface CollectibleVideoProps {
  src: string;
  alt: string;
  height?: number;
  onPress?(): void;
}

export function CollectibleVideo({ src, alt, height = 200, onPress }: CollectibleVideoProps) {
  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <button
          type="button"
          onClick={onPress}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            background: 'transparent',
            width: '100%',
            height,
          }}
        >
          <Box
            height={height}
            bg="ink.background-secondary"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <PaperPlaneIcon />
            <styled.span textStyle="caption.01">{alt}</styled.span>
          </Box>
        </button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard height={height}>
      <video
        src={src}
        controls
        style={{
          width: '100%',
          height,
          display: 'block',
          objectFit: 'cover',
          background: 'black',
        }}
        playsInline
      />
    </CollectibleCard>
  );
}
