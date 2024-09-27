import { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Avatar, Flag, ItemLayout, RadioButton } from '@leather.io/ui/native';

interface NetworkCellProps {
  caption: string;
  icon: ReactNode;
  isSelected: boolean;
  onChangeNetwork(): void;
  title: string;
}
export function NetworkCell({
  caption,
  icon,
  isSelected,
  onChangeNetwork,
  title,
}: NetworkCellProps) {
  return (
    <Pressable onPress={onChangeNetwork}>
      <Flag img={<Avatar>{icon}</Avatar>}>
        <ItemLayout
          actionIcon={<RadioButton disabled isSelected={isSelected} />}
          titleLeft={title}
          captionLeft={caption}
        />
      </Flag>
    </Pressable>
  );
}
