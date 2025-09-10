import { Image } from 'expo-image';

import { Box } from '../../../../native';

export interface CollectibleImageProps {
  alt: string;
  source: string;
  height?: number;
}
export function CollectibleImage({ alt, source, height = 200 }: CollectibleImageProps) {
  return (
    <Box overflow="hidden" height={height}>
      <Image
        source={{ uri: source }}
        alt={alt}
        style={{
          height: height,
        }}
      />
    </Box>
  );
}
