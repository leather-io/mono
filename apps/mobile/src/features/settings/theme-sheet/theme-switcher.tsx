import { ThemeStore } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';

import { ItemLayout, RadioButton, TouchableOpacity } from '@leather.io/ui/native';

interface ThemeSwitcherProps {
  activeTheme: ThemeStore;
  onUpdateTheme(theme: ThemeStore): void;
}
export function ThemeSwitcher({ activeTheme, onUpdateTheme }: ThemeSwitcherProps) {
  return (
    <>
      <TouchableOpacity onPress={() => onUpdateTheme('system')}>
        <ItemLayout
          actionIcon={<RadioButton disabled isSelected={activeTheme === 'system'} />}
          titleLeft={t`System`}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onUpdateTheme('light')}>
        <ItemLayout
          actionIcon={<RadioButton disabled isSelected={activeTheme === 'light'} />}
          titleLeft={t`Light`}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onUpdateTheme('dark')}>
        <ItemLayout
          actionIcon={<RadioButton disabled isSelected={activeTheme === 'dark'} />}
          titleLeft={t`Dark`}
        />
      </TouchableOpacity>
    </>
  );
}
