import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { AvailableLanguageCode, supportedLanguages } from '@/i18n/languages';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { reloadAppAsync } from 'expo';
import { entries } from 'remeda';

import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface LanguageSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function LanguageSheet({ sheetRef }: LanguageSheetProps) {
  const settings = useSettings();

  function onUpdateLanguage(language: AvailableLanguageCode) {
    settings.changeLanguagePreference(language);
    settings.changeLanguagePreferenceSource('user-selection');
    setTimeout(reloadAppAsync, 150);
  }

  return (
    <SettingsSheetLayout sheetRef={sheetRef} title={t`Language`}>
      <SettingsList gap="0">
        {entries(supportedLanguages).map(([code, name]) => (
          <SettingsListItem
            key={code}
            title={name}
            onPress={() => onUpdateLanguage(code)}
            type="radio"
            isRadioSelected={settings.languagePreference === code}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
