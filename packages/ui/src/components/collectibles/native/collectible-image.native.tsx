import { Image } from 'react-native';

import { Box } from '../../../../native';

interface CollectibleImageProps {
  alt: string;
  source: string;
  size?: number;
}
export function CollectibleImage({ alt, source, size = 200 }: CollectibleImageProps) {
  return (
    <Box width={size} height={size} borderRadius="lg" overflow="hidden">
      <Image source={{ uri: source }} alt={alt} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
