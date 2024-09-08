import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { ThemeStore, defaultThemes, useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { SheetRef, SunInCloudIcon } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from '../settings-sheet.layout';
import { ThemeCell } from './theme-cell';

interface ThemeSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function ThemeSheet({ sheetRef }: ThemeSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateTheme(theme: ThemeStore) {
    settings.changeTheme(theme);
    displayToast({ title: t`Theme updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<SunInCloudIcon />} sheetRef={sheetRef} title={t`Theme`}>
      {defaultThemes.map(theme => (
        <ThemeCell
          key={theme}
          activeTheme={settings.themeStore}
          onUpdateTheme={onUpdateTheme}
          theme={theme}
          title={i18n._(capitalize(theme))}
        />
      ))}
    </SettingsSheetLayout>
  );
}
