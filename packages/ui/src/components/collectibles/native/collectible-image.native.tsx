import { Image } from 'expo-image';

import { Box, Text } from '../../../../native';

interface CollectibleImageProps {
  alt: string;
  source: string;
  size?: number;
}
export function CollectibleImage({ alt, source, size = 200 }: CollectibleImageProps) {
  const isBns = source === 'bns';
  console.log('isBns', isBns);

  if (isBns) {
    return <BnsImage alt={alt} size={size} />;
  }

  return (
    <Box width={size} height={size} overflow="hidden">
      <Image source={{ uri: source }} alt={alt} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

function BnsImage({ alt, size = 200 }: Pick<CollectibleImageProps, 'alt' | 'size'>) {
  console.log('BnsImage', alt, size);
  return (
    <Box
      width={size}
      height={size}
      overflow="hidden"
      bg="ink.background-secondary"
      position="relative"
    >
      <Image
        source={require('../../../assets-native/images/bnsv2.png')}
        alt={alt}
        style={{ width: '100%', height: '100%' }}
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
