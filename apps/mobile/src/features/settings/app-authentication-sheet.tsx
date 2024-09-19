import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { ItemLayout, KeyholeIcon, SheetRef, Switch, TouchableOpacity } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateAppAuth() {
    settings.changeSecurityLevelPreference(
      settings.securityLevelPreference === 'secure' ? 'insecure' : 'secure'
    );
    displayToast({ title: t`App authorization updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<KeyholeIcon />} sheetRef={sheetRef} title={t`App authentication`}>
      <TouchableOpacity onPress={() => onUpdateAppAuth()}>
        <ItemLayout
          actionIcon={<Switch disabled value={settings.securityLevelPreference === 'secure'} />}
          captionLeft={t`Description`}
          titleLeft={t`Allow authentication`}
        />
      </TouchableOpacity>
    </SettingsSheetLayout>
  );
}
