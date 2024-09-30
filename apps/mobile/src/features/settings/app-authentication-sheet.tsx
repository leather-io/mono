import { RefObject } from 'react';
import { Pressable } from 'react-native';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import * as LocalAuthentication from 'expo-local-authentication';

import { ItemLayout, KeyholeIcon, SheetRef, Switch } from '@leather.io/ui/native';

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
      <Pressable onPress={() => onUpdateAppAuth()}>
        <ItemLayout
          actionIcon={<Switch disabled value={settings.securityLevelPreference === 'secure'} />}
          captionLeft={t`Description`}
          titleLeft={t`Allow authentication`}
        />
      </Pressable>
    </SettingsSheetLayout>
  );
}
