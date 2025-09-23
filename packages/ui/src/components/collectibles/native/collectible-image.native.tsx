import { Image } from 'expo-image';

import { Box, Pressable, PressableProps } from '../../../../native';

export interface CollectibleImageProps extends PressableProps {
  alt: string;
  source: string;
  height?: number;
}
export function CollectibleImage({ alt, source, height = 200, onPress }: CollectibleImageProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Box overflow="hidden" height={height}>
        <Image
          source={{ uri: source }}
          alt={alt}
          style={{
            height: height,
          }}
        />
      </Box>
    </Pressable>
  );
}
