import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { LEATHER_GUIDES_MOBILE_ACCOUNT_IDENTIFIER } from '@/shared/constants';
import {
  getAccountDisplayPreferencesKeyedByType,
  getChainDisplayLabel,
} from '@/shared/display-preference';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { AccountDisplayPreference } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

import { useOpenURL } from '../browser/browser/use-open-url';
import { SettingsSheetLayout } from './settings-sheet.layout';

interface AccountIdentifierSheetProps {
  sheetRef: SheetRef;
}
export function AccountIdentifierSheet({ sheetRef }: AccountIdentifierSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { openURL } = useOpenURL();

  function onUpdateAccountDisplayPreference(identifier: AccountDisplayPreference) {
    settings.changeAccountDisplayPreference(identifier);
    displayToast({
      title: t`Account identifier updated`,
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t`Account identifier`}
      onPressSupport={() => {
        openURL(LEATHER_GUIDES_MOBILE_ACCOUNT_IDENTIFIER);
      }}
    >
      <SettingsList gap="0">
        {Object.values(getAccountDisplayPreferencesKeyedByType()).map(accountDisplayPref => (
          <SettingsListItem
            key={accountDisplayPref.name}
            title={accountDisplayPref.name}
            caption={getChainDisplayLabel(accountDisplayPref.type)}
            onPress={() => onUpdateAccountDisplayPreference(accountDisplayPref.type)}
            type="radio"
            isRadioSelected={settings.accountDisplayPreference.type === accountDisplayPref.type}
          />
        ))}
      </SettingsList>
    </SettingsSheetLayout>
  );
}
