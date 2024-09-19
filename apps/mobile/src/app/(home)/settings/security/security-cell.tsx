import { ReactNode } from 'react';

import {
  Avatar,
  ChevronRightIcon,
  Flag,
  ItemLayout,
  TouchableOpacity,
} from '@leather.io/ui/native';

interface SecurityCellProps {
  caption: string;
  icon: ReactNode;
  onCreateSheetRef(): void;
  title: string;
}
export function SecurityCell({ caption, icon, onCreateSheetRef, title }: SecurityCellProps) {
  return (
    <TouchableOpacity onPress={onCreateSheetRef}>
      <Flag img={<Avatar>{icon}</Avatar>}>
        <ItemLayout
          actionIcon={<ChevronRightIcon variant="small" />}
          captionLeft={caption}
          titleLeft={title}
        />
      </Flag>
    </TouchableOpacity>
  );
}
