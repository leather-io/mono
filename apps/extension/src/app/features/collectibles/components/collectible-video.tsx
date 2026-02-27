import { Box, styled } from 'leather-styles/jsx';

import { PaperPlaneIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card';

interface CollectibleVideoProps {
  src: string;
  alt: string;
  onPress?(): void;
}

export function CollectibleVideo({ src, alt, onPress }: CollectibleVideoProps) {
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
          <Box
            width="100%"
            height="100%"
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
    <CollectibleCard>
      <styled.video
        src={src}
        controls
        width="100%"
        height="100%"
        display="block"
        objectFit="cover"
        bg="black"
        playsInline
      />
    </CollectibleCard>
  );
}
