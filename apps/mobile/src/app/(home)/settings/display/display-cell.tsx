import { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Avatar, ChevronRightIcon, Flag, ItemLayout } from '@leather.io/ui/native';

interface DisplayCellProps {
  caption: string;
  icon: ReactNode;
  onCreateSheetRef(): void;
  title: string;
}
export function DisplayCell({ caption, icon, onCreateSheetRef, title }: DisplayCellProps) {
  return (
    <Pressable onPress={onCreateSheetRef}>
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
