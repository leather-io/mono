import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { ThemePreference, defaultThemePreferences } from '@/store/settings/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { Cell, SheetRef, SunInCloudIcon } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface ThemeSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function ThemeSheet({ sheetRef }: ThemeSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateTheme(theme: ThemePreference) {
    settings.changeThemePreference(theme);
    displayToast({
      title: t({
        id: 'theme.toast_title',
        message: 'Theme updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      icon={<SunInCloudIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'theme.header_title',
        message: 'Theme',
      })}
    >
      {defaultThemePreferences.map(theme => (
        <Cell.Root
          title={i18n._({
            id: 'theme.cell_title',
            message: '{theme}',
            values: { theme: capitalize(theme) },
          })}
          key={theme}
          onPress={() => onUpdateTheme(theme)}
        >
          <Cell.Radio isSelected={settings.themePreference === theme} />
        </Cell.Root>
      ))}
    </SettingsSheetLayout>
  );
}
