import { PixelRatio } from 'react-native';

import { Image } from 'expo-image';

interface FaviconProps {
  origin: string;
  size?: 16 | 32 | 64;
}

export function Favicon({ origin, size = 16 }: FaviconProps) {
  const pixelRatio = PixelRatio.get();

  return (
    <Image
      source={`https://www.google.com/s2/favicons?domain=${origin}&sz=${size * pixelRatio}`}
      style={{ width: size, height: size }}
      alt={`Favicon of ${origin}`}
    />
  );
}
