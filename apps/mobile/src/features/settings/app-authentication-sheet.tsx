import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import * as LocalAuthentication from 'expo-local-authentication';

import { KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateAppAuth() {
    LocalAuthentication.authenticateAsync()
      .then(result => {
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
          return;
        }
        displayToast({
          title: t({
            id: 'app_auth.toast_title_error',
            message: 'Failed to authenticate',
          }),
          type: 'error',
        });
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
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'app_auth.cell_title',
            message: 'Allow authentication',
          })}
          caption={t({
            id: 'app_auth.cell_caption',
            message: 'Placeholder',
          })}
          type="switch"
          switchValue={settings.securityLevelPreference === 'secure'}
          onSwitchValueChange={() => onUpdateAppAuth()}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
