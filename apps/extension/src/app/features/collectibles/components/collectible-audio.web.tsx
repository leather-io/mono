import { Box, styled } from 'leather-styles/jsx';

import { HeadsetIcon } from '@leather.io/ui';

import { CollectibleCard } from './collectible-card.web';

interface CollectibleAudioProps {
  src: string;
  alt: string;
  size?: number;
  onPress?(): void;
}

export function CollectibleAudio({ src, alt, size = 200, onPress }: CollectibleAudioProps) {
  if (onPress) {
    return (
      <CollectibleCard height={size}>
        <styled.button
          type="button"
          onClick={onPress}
          border="none"
          p={0}
          m={0}
          bg="transparent"
          width="100%"
          height={size}
        >
          <Box
            height={size}
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
    <CollectibleCard height={size}>
      <styled.audio
        src={src}
        controls
        width="100%"
        height={size}
        display="block"
        bg="ink.background-secondary"
      />
    </CollectibleCard>
  );
}
