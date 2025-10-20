import { Image } from 'expo-image';

import { Box, Text, Pressable } from '../../../../native';
import { CollectibleImageProps } from './collectible-image.native';

export function BnsImage({ alt, source, height = 200, onPress }: CollectibleImageProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
    <Box height={height} overflow="hidden" bg="ink.background-secondary" position="relative">
      <Image source={{ uri: source }} alt={alt} style={{ height: height }} />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="3"
        justifyContent="center"
        alignSelf="stretch"
      >
        <Text
          variant="label02"
          textAlign="center"
          style={{ color: '#F09D00' }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {alt}
        </Text>
      </Box>
    </Box>
    </Pressable>
  );
}
