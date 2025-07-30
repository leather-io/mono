import { ComponentProps } from 'react';

import { Image } from 'expo-image';

export function Sticker({ source }: { source: ComponentProps<typeof Image>['source'] }) {
  return <Image style={{ height: 200, width: 270 }} contentFit="contain" source={source} />;
}
