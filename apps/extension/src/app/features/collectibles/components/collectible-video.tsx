import { Box, styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';

interface CollectibleVideoProps {
  src: string;
  onPress?(): void;
}

export function CollectibleVideo({ src, onPress }: CollectibleVideoProps) {
  if (onPress) {
    return (
      <CollectibleCard>
        <Box position="relative" width="100%" height="100%">
          <styled.video
            src={src}
            muted
            autoPlay
            loop
            playsInline
            width="100%"
            height="100%"
            display="block"
            objectFit="cover"
            bg="black"
          />
          <styled.button
            type="button"
            onClick={onPress}
            position="absolute"
            inset={0}
            zIndex={1}
            bg="transparent"
            border="none"
            cursor="pointer"
            p={0}
            m={0}
          />
        </Box>
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
