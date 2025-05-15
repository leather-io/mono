import { RefObject } from 'react';
import { Linking } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useAuthentication } from '@/hooks/use-authentication';
import { LEATHER_GUIDES_MOBILE_APP_AUTHENTICATION } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { authenticate } = useAuthentication();

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
            title: t({
              id: 'app_auth.toast_title_success',
              message: 'App authorization updated',
            }),
            type: 'success',
          });
        } else {
          displayToast({
            title: t({
              id: 'app_auth.toast_title_error',
              message: 'Failed to authenticate',
            }),
            type: 'error',
          });
        }
      })
      .catch(() =>
        displayToast({
          title: t({
            id: 'app_auth.toast_title_error',
            message: 'Failed to authenticate',
          }),
          type: 'error',
        })
      );
  }

  return (
    <SettingsSheetLayout
      icon={<KeyholeIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'app_auth.header_title',
        message: 'App authentication',
      })}
      onPressSupport={() => void Linking.openURL(LEATHER_GUIDES_MOBILE_APP_AUTHENTICATION)}
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'app_auth.cell_title',
            message: 'App authentication',
          })}
          caption={t({
            id: 'app_auth.cell_caption',
            message: 'Require biometrics or PIN',
          })}
          type="switch"
          switchValue={settings.securityLevelPreference === 'secure'}
          onSwitchValueChange={() => onUpdateAppAuth()}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
