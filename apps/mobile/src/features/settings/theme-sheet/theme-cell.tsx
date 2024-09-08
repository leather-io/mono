import { ThemeStore } from '@/store/settings/settings.write';

import { ItemLayout, RadioButton, TouchableOpacity } from '@leather.io/ui/native';

interface ThemeCellProps {
  activeTheme: ThemeStore;
  onUpdateTheme(theme: ThemeStore): void;
  theme: ThemeStore;
  title: string;
}
export function ThemeCell({ activeTheme, onUpdateTheme, theme, title }: ThemeCellProps) {
  return (
    <TouchableOpacity onPress={() => onUpdateTheme(theme)}>
      <ItemLayout
        actionIcon={<RadioButton disabled isSelected={activeTheme === theme} />}
        titleLeft={title}
      />
    </TouchableOpacity>
  );
}
