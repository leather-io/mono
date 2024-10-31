import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { getSecureStoreConfig } from '@/store/storage-persistors';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';

import * as SecureStoreUtils from '@leather.io/secure-store-utils';
import { Cell, KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const { securityLevelPreference, changeSecurityLevelPreference } = useSettings();
  const { list } = useWallets();
  const fingerprints = list.map(w => w.fingerprint);
  const { displayToast } = useToastContext();

  async function onUpdateAppAuth() {
    const isSettingSecure = securityLevelPreference !== 'secure';
    try {
      await SecureStoreUtils.updateKeysSecuritySettingsAsync(
        fingerprints,
        getSecureStoreConfig(isSettingSecure)
      );
      changeSecurityLevelPreference(isSettingSecure ? 'secure' : 'insecure');
      displayToast({
        title: t({
          id: 'app_auth.toast_title_success',
          message: 'App authorization updated',
        }),
        type: 'success',
      });
    } catch (_) {
      displayToast({
        title: t({
          id: 'app_auth.toast_title_error',
          message: 'Failed to authenticate',
        }),
        type: 'error',
      });
    }
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
      <Cell.Root
        title={t({
          id: 'app_auth.cell_title',
          message: 'Allow authentication',
        })}
        caption={t({
          id: 'app_auth.cell_caption',
          message: 'Placeholder',
        })}
        onPress={onUpdateAppAuth}
      >
        <Cell.Switch
          value={securityLevelPreference === 'secure'}
          onValueChange={() => onUpdateAppAuth()}
        />
      </Cell.Root>
    </SettingsSheetLayout>
  );
}
