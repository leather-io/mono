import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { LocalePreference } from '@/store/settings/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { GlobeIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface LocaleSelectionSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function LocaleSelectionSheet({ sheetRef }: LocaleSelectionSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateLocale(locale: LocalePreference) {
    settings.changeLocalePreference(locale);
    displayToast({
      title: t({
        id: 'locale_selection.toast_title',
        message: 'Language updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      icon={<GlobeIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'locale_selection.header_title',
        message: 'Locale',
      })}
    >
      {/* LEA-2138: Hardcoding the locales for now based on the translations available */}
      <SettingsList gap="0">
        <SettingsListItem
          title={i18n._({
            id: 'locale_selection.cell_title.en',
            message: 'English',
          })}
          caption={i18n._({
            id: 'locale_selection.cell_caption.en',
            message: '{locale}',
            values: { locale: 'en' },
          })}
          key="en"
          onPress={() => onUpdateLocale('en')}
          type="radio"
          isRadioSelected={settings.localePreference === 'en'}
        />
        <SettingsListItem
          title={i18n._({
            id: 'locale_selection.cell_title.es',
            message: 'Spanish',
          })}
          caption={i18n._({
            id: 'locale_selection.cell_caption.es',
            message: '{locale}',
            values: { locale: 'es' },
          })}
          key="es"
          onPress={() => onUpdateLocale('es')}
          type="radio"
          isRadioSelected={settings.localePreference === 'es'}
        />
        <SettingsListItem
          title={i18n._({
            id: 'locale_selection.cell_title.zh',
            message: 'Chinese',
          })}
          caption={i18n._({
            id: 'locale_selection.cell_caption.zh',
            message: '{locale}',
            values: { locale: 'zh' },
          })}
          key="zh"
          onPress={() => onUpdateLocale('zh')}
          type="radio"
          isRadioSelected={settings.localePreference === 'zh'}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
