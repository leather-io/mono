import { Box, styled } from 'leather-styles/jsx';

import { CollectibleCard } from './collectible-card.web';

interface BnsImageContentProps {
  alt?: string;
  src: string;
}

function BnsImageContent({ alt, src }: BnsImageContentProps) {
  return (
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
        p="space.03"
        justifyContent="center"
        textAlign="center"
      >
        <styled.span
          color="#F09D00"
          textStyle="label.02"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          display="block"
        >
          {alt}
        </styled.span>
      </Box>
    </Box>
  );
}

interface BnsImageProps {
  alt?: string;
  src: string;
  onPress?(): void;
}

export function BnsImage({ alt, src, onPress }: BnsImageProps) {
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
          <BnsImageContent alt={alt} src={src} />
        </styled.button>
      </CollectibleCard>
    );
  }

  return (
    <CollectibleCard>
      <BnsImageContent alt={alt} src={src} />
    </CollectibleCard>
  );
}
