import { Image } from 'expo-image';

import { Box, Text } from '../../../../native';
import { CollectibleImageProps } from './collectible-image.native';

export function BnsImage({ alt, height = 200 }: Pick<CollectibleImageProps, 'alt' | 'height'>) {
  return (
    <Box height={height} overflow="hidden" bg="ink.background-secondary" position="relative">
      <Image
        source={require('../../../assets-native/images/bnsv2.png')}
        alt={alt}
        style={{ height: height }}
      />
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
  );
}
