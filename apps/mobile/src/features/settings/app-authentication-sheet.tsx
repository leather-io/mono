import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useAuthentication } from '@/hooks/use-authentication';
import { LEATHER_GUIDES_MOBILE_APP_AUTHENTICATION } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

import { useOpenURL } from '../browser/browser/use-open-url';
import { SettingsSheetLayout } from './settings-sheet.layout';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { authenticate } = useAuthentication();
  const { openURL } = useOpenURL();

  function onUpdateAppAuth() {
    authenticate()
      .then(result => {
        if (!result) {
          // Do nothing if result is undefined, as that means it's already handled by useAuthentication hook
          return;
        }

        if (result.success) {
          settings.changeSecurityLevelPreference(
            settings.securityLevelPreference === 'secure' ? 'insecure' : 'secure'
          );
          displayToast({
            title: t`App authorization updated`,
            type: 'success',
          });
        } else {
          displayToast({
            title: t`Failed to authenticate`,
            type: 'error',
          });
        }
      })
      .catch(() =>
        displayToast({
          title: t`Failed to authenticate`,
          type: 'error',
        })
      );
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t`App authentication`}
      onPressSupport={() => openURL(LEATHER_GUIDES_MOBILE_APP_AUTHENTICATION)}
    >
      <SettingsList>
        <SettingsListItem
          title={t`App authentication`}
          caption={t`Require biometrics or PIN`}
          type="switch"
          switchValue={settings.securityLevelPreference === 'secure'}
          onSwitchValueChange={() => onUpdateAppAuth()}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
