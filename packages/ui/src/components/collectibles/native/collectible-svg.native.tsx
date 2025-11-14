import { ReactNode, useState } from 'react';
import { SvgUri } from 'react-native-svg';

import { Box, Pressable, PressableProps } from '../../../../native';
import { ImageUnavailable } from './image-unavailable.native';

interface CollectibleSvgProps extends PressableProps {
  src: string;
  height?: number;
  imageUnavailableLabel?: ReactNode;
}

export function CollectibleSvg({
  src,
  height = 200,
  onPress,
  imageUnavailableLabel,
}: CollectibleSvgProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <ImageUnavailable height={height} message={imageUnavailableLabel} />
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
          preserveAspectRatio="xMidYMid meet"
          onError={() => setHasError(true)}
        />
      </Box>
    </Pressable>
  );
}
