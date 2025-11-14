import { useEffect, useState } from 'react';

import { Image } from 'expo-image';

import { Box, Pressable, PressableProps } from '../../../../native';
import { ImageUnavailable } from './image-unavailable.native';

export interface CollectibleImageProps extends PressableProps {
  alt: string;
  src: string;
  height?: number;
  thumbnailSrc?: string;
}
export function CollectibleImage({
  alt,
  src,
  height = 200,
  thumbnailSrc,
  onPress,
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
      <Box overflow="hidden" height={height}>
        <Image
          source={{ uri: thumbnailSrc ?? src }}
          alt={alt}
          style={{
            height,
            width: '100%',
          }}
          contentFit="cover"
          cachePolicy="disk"
          onError={() => setHasError(true)}
        />
      </Box>
    </Pressable>
  );
}
