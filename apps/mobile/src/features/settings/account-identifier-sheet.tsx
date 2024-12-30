import { RefObject } from 'react';
import { Linking } from 'react-native';

import { getAccountDisplayPreferencesKeyedByType } from '@/common/display-preference';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { GuideLinks } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { AccountDisplayPreference } from '@leather.io/models';
import { PackageSecurityIcon, SheetRef } from '@leather.io/ui/native';
import { match } from '@leather.io/utils';

import { SettingsSheetLayout } from './settings-sheet.layout';

function getAccountDisplayPrefDescription(preference: AccountDisplayPreference) {
  const matchPreference = match<AccountDisplayPreference>();
  return matchPreference(preference, {
    taproot: t({
      id: 'account_display_preference.description.taproot',
      message: 'Layer 1 • Bitcoin',
    }),
    'native-segwit': t({
      id: 'account_display_preference.description.native_segwit',
      message: 'Layer 1 • Bitcoin',
    }),
    bns: t({ id: 'account_display_preference.description.bns', message: 'Layer 2 • Stacks' }),
    stacks: t({ id: 'account_display_preference.description.stacks', message: 'Layer 2 • Stacks' }),
  });
}

interface AccountIdentifierSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AccountIdentifierSheet({ sheetRef }: AccountIdentifierSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

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
        void Linking.openURL(GuideLinks.AccountIdentifier);
      }}
    >
      <SettingsList gap="0">
        {Object.values(getAccountDisplayPreferencesKeyedByType()).map(accountDisplayPref => (
          <SettingsListItem
            key={accountDisplayPref.name}
            title={accountDisplayPref.name}
            caption={getAccountDisplayPrefDescription(accountDisplayPref.type)}
            onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}
            type="radio"
            isRadioSelected={settings.accountDisplayPreference.type === accountDisplayPref.type}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
