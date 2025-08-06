import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { AvailableLanguageCode, supportedLanguages } from '@/i18n/languages';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { entries } from 'remeda';

import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface LanguageSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function LanguageSheet({ sheetRef }: LanguageSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateLanguage(language: AvailableLanguageCode) {
    settings.changeLanguagePreference(language);
    displayToast({
      title: t`Language updated`,
      type: 'success',
    });
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
