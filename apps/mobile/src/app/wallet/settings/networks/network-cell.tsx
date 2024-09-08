import { ReactNode } from 'react';

import { Avatar, Flag, ItemLayout, RadioButton, TouchableOpacity } from '@leather.io/ui/native';

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
    <TouchableOpacity onPress={onChangeNetwork}>
      <Flag img={<Avatar>{icon}</Avatar>}>
        <ItemLayout
          actionIcon={<RadioButton disabled isSelected={isSelected} />}
          titleLeft={title}
          captionLeft={caption}
        />
      </Flag>
    </TouchableOpacity>
  );
}
