import { useEffect, useState } from 'react';

import { Image } from 'expo-image';

import { Box, Pressable, PressableProps } from '../../../../native';
import { ImageUnavailable } from './image-unavailable.native';

export interface CollectibleImageProps extends PressableProps {
  alt: string;
  source: string;
  height?: number;
}
export function CollectibleImage({ alt, source, height = 200, onPress }: CollectibleImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!source);
  }, [source]);

  if (!source || hasError) {
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
          source={{ uri: source }}
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
