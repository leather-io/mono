import { useRef } from 'react';

import { AnalyticsSheet } from '@/features/settings/analytics-sheet';
import { AppAuthenticationSheet } from '@/features/settings/app-authentication-sheet';
import { useSettings } from '@/store/settings/settings';
import { SecurityLevelPreference } from '@/store/settings/utils';
import { t } from '@lingui/macro';

import { Cell, CookieIcon, KeyholeIcon, SheetRef } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

function getCaption(securityLevelPreference: SecurityLevelPreference) {
  switch (securityLevelPreference) {
    case 'secure':
      return t({
        id: 'security.app_auth.cell_caption_enabled',
        message: 'Enabled',
      });
    // Show not-selected state as disabled for now
    case 'not-selected':
    case 'insecure':
      return t({
        id: 'security.app_auth.cell_caption_disabled',
        message: 'Disabled',
      });
  }
}

export default function SettingsSecurityScreen() {
  const analyticsSheetRef = useRef<SheetRef>(null);
  const appAuthenticationSheetRef = useRef<SheetRef>(null);
  const settings = useSettings();

  return (
    <>
      <SettingsScreenLayout>
        <Cell.Root
          title={t({
            id: 'security.analytics.cell_title',
            message: 'Analytics',
          })}
          caption={
            settings.analyticsPreference === 'consent-given'
              ? t({
                  id: 'security.analytics.cell_caption_enabled',
                  message: 'Enabled',
                })
              : t({
                  id: 'security.analytics.cell_caption_disabled',
                  message: 'Disabled',
                })
          }
          icon={<CookieIcon />}
          onPress={() => {
            analyticsSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'security.app_auth.cell_title',
            message: 'App authentication',
          })}
          caption={getCaption(settings.securityLevelPreference)}
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
