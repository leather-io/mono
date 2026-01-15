import { Box, styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card';
import { type CollectibleImageProps } from './collectible-image';

interface BnsImageLabelProps {
  alt?: string;
}
export function BnsImage({ alt, src, height = 200, onPress }: CollectibleImageProps) {
  function BnsImageLabel({ alt }: BnsImageLabelProps) {
    return (
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
    );
  }

  interface BnsImageContentProps extends BnsImageLabelProps {
    src: string;
    height?: number;
  }

  function BnsImageContent({ alt, src, height }: BnsImageContentProps) {
    return (
      <Box height={height} overflow="hidden" bg="ink.background-secondary" position="relative">
        <styled.img src={src} alt={alt} height={height} width="100%" objectFit="cover" />
        <BnsImageLabel alt={alt} />
      </Box>
    );
  }

  const image = <BnsImageContent alt={alt} src={src} height={height} />;

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
        >
          {image}
        </styled.button>
      </CollectibleCard>
    );
  }

  return <CollectibleCard height={height}>{image}</CollectibleCard>;
}
