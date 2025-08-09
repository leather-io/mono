import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { ThemePreference, defaultThemePreferences } from '@/store/settings/utils';
import { select, t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface ThemeSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function ThemeSheet({ sheetRef }: ThemeSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateTheme(theme: ThemePreference) {
    settings.changeThemePreference(theme);
    displayToast({
      title: t`Theme updated`,
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout sheetRef={sheetRef} title={t`Theme`}>
      <SettingsList gap="0">
        {defaultThemePreferences.map(themePreference => (
          <SettingsListItem
            title={t({
              message: select(themePreference, {
                light: 'Light',
                dark: 'Dark',
                system: 'System',
                other: 'Unknown',
              }),
            })}
            key={themePreference}
            onPress={() => onUpdateTheme(themePreference)}
            type="radio"
            isRadioSelected={settings.themePreference === themePreference}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
