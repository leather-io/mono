import { Image } from 'react-native';

import { Box } from '@leather.io/ui/native';

interface CollectibleImageProps {
  alt: string;
  source: string;
}
export function CollectibleImage({ alt, source }: CollectibleImageProps) {
  return (
    <Box width={200} height={200} borderRadius="lg" overflow="hidden">
      <Image source={{ uri: source }} alt={alt} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
