import type { ReactNode } from 'react';

import { Image, type ImageSource } from 'expo-image';

import { Cell } from '@leather.io/ui/native';

const imageSize = 40;

interface NftSectionCellProps {
  image: ImageSource;
  asideComponent?: ReactNode;
  title: string;
  caption: string;
  onPress?(): void;
}
export function NftSectionCell({
  image,
  asideComponent,
  title,
  caption,
  onPress,
}: NftSectionCellProps) {
  return (
    <Cell.Root pressable={!!onPress} onPress={onPress}>
      <Cell.Icon borderRadius="round">
        <Image source={image} style={{ width: imageSize, height: imageSize }} />
      </Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{title}</Cell.Label>
        <Cell.Label variant="secondary">{caption}</Cell.Label>
      </Cell.Content>
      {asideComponent ? <Cell.Aside>{asideComponent}</Cell.Aside> : null}
    </Cell.Root>
  );
}
