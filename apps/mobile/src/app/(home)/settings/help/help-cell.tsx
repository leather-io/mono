import { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Avatar, ChevronRightIcon, Flag, ItemLayout } from '@leather.io/ui/native';

interface DisplayCellProps {
  caption: string;
  icon: ReactNode;
  onPress(): void;
  title: string;
}
export function HelpCell({ caption, icon, onPress, title }: DisplayCellProps) {
  return (
    <Pressable onPress={onPress}>
      <Flag img={<Avatar>{icon}</Avatar>}>
        <ItemLayout
          actionIcon={<ChevronRightIcon variant="small" />}
          captionLeft={caption}
          titleLeft={title}
        />
      </Flag>
    </Pressable>
  );
}
