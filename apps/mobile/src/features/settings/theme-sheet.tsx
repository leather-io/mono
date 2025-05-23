import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { ThemePreference, defaultThemePreferences } from '@/store/settings/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { SheetRef } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface ThemeSheetProps {
  sheetRef: RefObject<SheetRef | null>;
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
      sheetRef={sheetRef}
      title={t({
        id: 'theme.header_title',
        message: 'Theme',
      })}
    >
      <SettingsList gap="0">
        {defaultThemePreferences.map(theme => (
          <SettingsListItem
            title={i18n._({
              id: 'theme.cell_title',
              message: '{theme}',
              values: { theme: capitalize(theme) },
            })}
            key={theme}
            onPress={() => onUpdateTheme(theme)}
            type="radio"
            isRadioSelected={settings.themePreference === theme}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
