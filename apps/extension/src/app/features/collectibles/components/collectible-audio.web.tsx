import { Box, styled } from 'leather-styles/jsx';

import { HeadsetIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card.web';

interface CollectibleAudioProps {
  src: string;
  alt: string;
  onPress?(): void;
}

export function CollectibleAudio({ src, alt, onPress }: CollectibleAudioProps) {
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
            <HeadsetIcon />
            <styled.span textAlign="center" textStyle="label.02">
              {alt}
            </styled.span>
          </Box>
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <styled.audio
        src={src}
        controls
        width="100%"
        height="100%"
        display="block"
        bg="ink.background-secondary"
      />
    </CollectibleCard>
  );
}
