import { Box, styled } from 'leather-styles/jsx';

import { HeadsetIcon } from '@leather.io/ui';
import { CollectibleCard } from './collectible-card.web';

interface CollectibleAudioProps {
  src: string;
  alt: string;
  size?: number;
  onPress?: () => void;
}

export function CollectibleAudio({ src, alt, size = 200, onPress }: CollectibleAudioProps) {
  if (onPress) {
    return (
      <CollectibleCard height={size}>
        <button
          type="button"
          onClick={onPress}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            background: 'transparent',
            width: '100%',
            height: size,
          }}
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
        </button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard height={size}>
      <audio
        src={src}
        controls
        style={{
          width: '100%',
          height: size,
          display: 'block',
          background: 'var(--colors-ink-background-secondary)',
        }}
      />
    </CollectibleCard>
  );
}
