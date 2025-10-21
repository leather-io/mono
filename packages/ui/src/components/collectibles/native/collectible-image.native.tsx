import { Image } from 'expo-image';

import { CollectibleCard, Pressable, PressableProps } from '../../../../native';

export interface CollectibleImageProps extends PressableProps {
  alt: string;
  source: string;
  height?: number;
}
export function CollectibleImage({ alt, source, height = 200, onPress }: CollectibleImageProps) {
  const content = (
    <CollectibleCard height={height}>
      <Image
        source={{ uri: source }}
        alt={alt}
        style={{
          height: height,
          width: '100%',
        }}
        contentFit="cover"
        recyclingKey={source}
      />
    </CollectibleCard>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} haptics="light" pressEffects={{ opacity: { from: 1, to: 0.8 } }}>
        {content}
      </Pressable>
    );
  }

  return content;
}
