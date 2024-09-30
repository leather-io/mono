import { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Avatar, ChevronRightIcon, Flag, ItemLayout } from '@leather.io/ui/native';

interface DisplayCellProps {
  actionIcon?: ReactNode;
  caption: string;
  icon: ReactNode;
  onPress(): void;
  title: string;
}
export function DisplayCell({ actionIcon, caption, icon, onPress, title }: DisplayCellProps) {
  return (
    <Pressable onPress={onPress}>
      <Flag img={<Avatar>{icon}</Avatar>}>
        <ItemLayout
          actionIcon={actionIcon ?? <ChevronRightIcon variant="small" />}
          captionLeft={caption}
          titleLeft={title}
        />
      </Flag>
    </Pressable>
  );
}
