import { useEffect, useState } from 'react';

import { Image } from 'expo-image';

import { Box, Pressable, PressableProps } from '@leather.io/ui/native';

import { ImageUnavailable } from './image-unavailable';

export interface CollectibleImageProps extends PressableProps {
  alt: string;
  src: string;
  height?: number;
  thumbnailSrc?: string;

  isSvg?: boolean;
}
export function CollectibleImage({
  alt,
  src,
  height = 200,
  thumbnailSrc,
  onPress,
  isSvg = false,
}: CollectibleImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (!src || hasError) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageUnavailable height={height} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Box
        overflow="hidden"
        height={height}
        backgroundColor={isSvg ? 'ink.background-primary' : undefined}
      >
        <Image
          source={{ uri: thumbnailSrc ?? src }}
          alt={alt}
          style={{
            height,
            width: '100%',
            backgroundColor: isSvg ? 'ink.background-primary' : undefined,
          }}
          contentFit="contain"
          cachePolicy="disk"
          onError={() => setHasError(true)}
        />
      </Box>
    </Pressable>
  );
}
