import { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { Avatar, ChevronRightIcon, Flag, ItemLayout } from '@leather.io/ui/native';

interface SettingsCellProps {
  caption?: string;
  icon: ReactNode;
  onPress(): void;
  title: string;
}
export function SettingsCell({ caption, icon, onPress, title }: SettingsCellProps) {
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
