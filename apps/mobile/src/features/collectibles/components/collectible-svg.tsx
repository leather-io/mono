import { useState } from 'react';
import { SvgUri } from 'react-native-svg';

import { Box, Pressable, PressableProps } from '@leather.io/ui/native';

import { ImageUnavailable } from './image-unavailable';

interface CollectibleSvgProps extends PressableProps {
  src: string;
  height?: number;
}

export function CollectibleSvg({ src, height = 200, onPress }: CollectibleSvgProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageUnavailable height={height} />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Box height={height} justifyContent="center" alignItems="center" overflow="hidden">
        <SvgUri
          uri={src}
          width="100%"
          height="100%"
          // eslint-disable-next-line lingui/no-unlocalized-strings
          preserveAspectRatio="xMidYMid meet"
          onError={() => setHasError(true)}
        />
      </Box>
    </Pressable>
  );
}
