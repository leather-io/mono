import { RefObject } from 'react';
import { Linking } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { LEATHER_GUIDES_MOBILE_ACCOUNT_IDENTIFIER } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { accountDisplayPreferencesKeyedByType } from '@leather.io/constants';
import { AccountDisplayPreference } from '@leather.io/models';
import { PackageSecurityIcon, SheetRef } from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AccountIdentifierSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AccountIdentifierSheet({ sheetRef }: AccountIdentifierSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { i18n } = useLingui();

  function onUpdateAccountDisplayPreference(identifier: AccountDisplayPreference) {
    settings.changeAccountDisplayPreference(identifier);
    displayToast({
      title: t({
        id: 'account_identifier.toast_title',
        message: 'Account identifier updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      icon={<PackageSecurityIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'account_identifier.header_title',
        message: 'Account identifier',
      })}
      onPressSupport={() => {
        Linking.openURL(LEATHER_GUIDES_MOBILE_ACCOUNT_IDENTIFIER);
      }}
    >
      <SettingsList gap="0">
        {Object.values(accountDisplayPreferencesKeyedByType).map(accountDisplayPref => (
          <SettingsListItem
            key={accountDisplayPref.name}
            title={i18n._({
              id: 'account_identifier.cell_title',
              message: '{name}',
              values: { name: accountDisplayPref.name },
            })}
            caption={t({
              id: 'account_identifier.cell_caption',
              message: `${capitalize(i18n._(accountDisplayPref.blockchain))} blockchain`,
            })}
            onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}
            type="radio"
            isRadioSelected={settings.accountDisplayPreference.type === accountDisplayPref.type}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
