import { Image } from 'react-native';

import { Box, Eye1ClosedIcon, Text } from '../../../../native';

interface CollectibleImageProps {
  alt: string;
  source: string;
  size?: number;
}
export function CollectibleImage({ alt, source, size = 200 }: CollectibleImageProps) {
  const isBns = alt.includes('.btc') || source.includes('BNS-V2');

  // Don't render if source is empty
  if (!source || source.trim() === '') {
    return (
      <Box
        width={size}
        height={size}
        bg="ink.background-secondary"
        justifyContent="center"
        alignItems="center"
      >
        <Eye1ClosedIcon />
        <Text variant="label02" color="ink.text-subdued">
          No Image
        </Text>
      </Box>
    );
  }

  if (isBns) {
    return <BnsImage alt={alt} source={source} size={size} />;
  }

  return (
    <Box width={size} height={size} overflow="hidden">
      <Image source={{ uri: source }} alt={alt} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

function BnsImage({ alt, source, size = 200 }: CollectibleImageProps) {
  return (
    <Box
      width={size}
      height={size}
      overflow="hidden"
      bg="ink.background-secondary"
      position="relative"
    >
      {source && source.trim() !== '' && (
        <Image
          source={{ uri: source }}
          alt={alt}
          height={58}
          width={164}
          style={{ marginTop: 44 }}
        />
      )}
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
