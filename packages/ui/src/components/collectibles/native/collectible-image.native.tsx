import { Image } from 'react-native';

import { Box } from '../../../../native';
import { Text } from '../../../../native';

interface CollectibleImageProps {
  alt: string;
  source: string;
  size?: number;
}
export function CollectibleImage({ alt, source, size = 200 }: CollectibleImageProps) {
  const isBns = alt.includes('.btc') || source.includes('BNS-V2');

  if (isBns) {
    return <BnsImage alt={alt} source={source} size={size} />;
  }

  return (
    <Box width={size} height={size} borderRadius="lg" overflow="hidden">
      <Image source={{ uri: source }} alt={alt} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

function BnsImage({ alt, source, size = 200 }: CollectibleImageProps) {
  return (
    <Box
      width={size}
      height={size}
      borderRadius="lg"
      overflow="hidden"
      bg="ink.background-secondary"
      position="relative"
    >
      <Image source={{ uri: source }} alt={alt} height={58} width={164} style={{ marginTop: 44 }} />
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
