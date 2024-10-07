import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import * as LocalAuthentication from 'expo-local-authentication';

import { Cell, KeyholeIcon, SheetRef } from '@leather.io/ui/native';

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
          displayToast({ title: t`App authorization updated`, type: 'success' });
          return;
        }
        displayToast({ title: t`Failed to authenticate`, type: 'error' });
      })
      .catch(() => displayToast({ title: t`Error trying to authenticate`, type: 'error' }));
  }

  return (
    <SettingsSheetLayout icon={<KeyholeIcon />} sheetRef={sheetRef} title={t`App authentication`}>
      <Cell.Root
        title={t`Allow authentication`}
        caption={t`Description`}
        onPress={() => onUpdateAppAuth()}
      >
        <Cell.Switch
          value={settings.securityLevelPreference === 'secure'}
          onValueChange={() => onUpdateAppAuth()}
        />
      </Cell.Root>
    </SettingsSheetLayout>
  );
}
