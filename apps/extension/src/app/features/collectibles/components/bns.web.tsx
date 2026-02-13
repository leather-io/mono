import { Box, styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';

interface BnsImageProps {
  alt?: string;
  src: string;
  onPress?(): void;
}

export function BnsImage({ alt, src, onPress }: BnsImageProps) {
  const image = (
    <Box
      width="100%"
      height="100%"
      overflow="hidden"
      bg="ink.background-secondary"
      position="relative"
    >
      <styled.img src={src} alt={alt} width="100%" height="100%" objectFit="cover" />
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
        <styled.span
          color="#F09D00"
          fontWeight="500"
          fontSize="14px"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        >
          {alt}
        </styled.span>
      </Box>
    </Box>
  );

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
          {image}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard>{image}</CollectibleCard>;
}
