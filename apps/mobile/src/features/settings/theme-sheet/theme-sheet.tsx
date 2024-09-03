import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { ThemeStore, useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

import { ThemeSheetLayout } from './theme-sheet.layout';
import { ThemeSwitcher } from './theme-switcher';

interface ThemeSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function ThemeSheet({ sheetRef }: ThemeSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateTheme(theme: ThemeStore) {
    settings.changeTheme(theme);
    displayToast({ title: t`Theme updated`, type: 'success' });
  }

  return (
    <ThemeSheetLayout sheetRef={sheetRef}>
      <ThemeSwitcher activeTheme={settings.themeStore} onUpdateTheme={onUpdateTheme} />
    </ThemeSheetLayout>
  );
}
