import { Box, styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';
import { type CollectibleImageProps } from './collectible-image.web';

export function BnsImage({ alt, src, height = 200, onPress }: CollectibleImageProps) {
  const image = (
    <Box height={height} overflow="hidden" bg="ink.background-secondary" position="relative">
      <styled.img src={src} alt={alt} height={height} width="100%" objectFit="cover" />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        py="space.03"
        px="space.04"
        bg="linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.8))"
        textAlign="center"
      >
        <styled.span color="#F09D00" fontWeight="600" textStyle="label.02">
          {alt}
        </styled.span>
      </Box>
    </Box>
  );

  if (onPress) {
    return (
      <CollectibleCard height={height}>
        <button
          type="button"
          onClick={onPress}
          style={{ border: 0, padding: 0, margin: 0, background: 'transparent', width: '100%' }}
        >
          {image}
        </button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{image}</CollectibleCard>;
}

