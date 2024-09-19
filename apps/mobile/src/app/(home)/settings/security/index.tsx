import { useRef } from 'react';

import { AnalyticsSheet } from '@/features/settings/analytics-sheet';
import { AppAuthenticationSheet } from '@/features/settings/app-authentication-sheet';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Box, CookieIcon, KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';
import { SecurityCell } from './security-cell';

export default function SettingsSecurityScreen() {
  const analyticsSheetRef = useRef<SheetRef>(null);
  const appAuthenticationSheetRef = useRef<SheetRef>(null);
  const settings = useSettings();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <SettingsScreenLayout>
        <SecurityCell
          title={t`Analytics`}
          caption={settings.analyticsPreference === 'consent-given' ? t`Enabled` : t`Disabled`}
          icon={<CookieIcon />}
          onCreateSheetRef={() => {
            analyticsSheetRef.current?.present();
          }}
        />
        <SecurityCell
          title={t`App authentication`}
          caption={settings.securityLevelPreference === 'secure' ? t`Enabled` : t`Disabled`}
          icon={<KeyholeIcon />}
          onCreateSheetRef={() => {
            appAuthenticationSheetRef.current?.present();
          }}
        />
      </SettingsScreenLayout>
      <AnalyticsSheet sheetRef={analyticsSheetRef} />
      <AppAuthenticationSheet sheetRef={appAuthenticationSheetRef} />
    </Box>
  );
}
