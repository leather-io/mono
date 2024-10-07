import { useRef } from 'react';

import { AnalyticsSheet } from '@/features/settings/analytics-sheet';
import { AppAuthenticationSheet } from '@/features/settings/app-authentication-sheet';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Cell, CookieIcon, KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

export default function SettingsSecurityScreen() {
  const analyticsSheetRef = useRef<SheetRef>(null);
  const appAuthenticationSheetRef = useRef<SheetRef>(null);
  const settings = useSettings();

  return (
    <>
      <SettingsScreenLayout>
        <Cell.Root
          title={t`Analytics`}
          caption={settings.analyticsPreference === 'consent-given' ? t`Enabled` : t`Disabled`}
          icon={<CookieIcon />}
          onPress={() => {
            analyticsSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t`App authentication`}
          caption={settings.securityLevelPreference === 'secure' ? t`Enabled` : t`Disabled`}
          icon={<KeyholeIcon />}
          onPress={() => {
            appAuthenticationSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>
      </SettingsScreenLayout>
      <AnalyticsSheet sheetRef={analyticsSheetRef} />
      <AppAuthenticationSheet sheetRef={appAuthenticationSheetRef} />
    </>
  );
}
