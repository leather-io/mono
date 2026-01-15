import { Box, styled } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card';

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
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          height={height}
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
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard height={height}>
      <styled.video
        src={src}
        controls
        width="100%"
        height={height}
        display="block"
        objectFit="cover"
        bg="black"
        playsInline
      />
    </CollectibleCard>
  );
}
