import { Pressable } from 'react-native';

import { ThemePreference } from '@/store/settings/settings';

import { ItemLayout, RadioButton } from '@leather.io/ui/native';

interface ThemeCellProps {
  activeTheme: ThemePreference;
  onUpdateTheme(theme: ThemePreference): void;
  theme: ThemePreference;
  title: string;
}
export function ThemeCell({ activeTheme, onUpdateTheme, theme, title }: ThemeCellProps) {
  return (
    <Pressable onPress={() => onUpdateTheme(theme)}>
      <ItemLayout
        actionIcon={<RadioButton disabled isSelected={activeTheme === theme} />}
        titleLeft={title}
      />
    </Pressable>
  );
}
