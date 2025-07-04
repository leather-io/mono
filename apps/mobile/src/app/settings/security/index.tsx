import { useRef } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { AnalyticsSheet } from '@/features/settings/analytics-sheet';
import { AppAuthenticationSheet } from '@/features/settings/app-authentication-sheet';
import SettingsLayout from '@/features/settings/settings-layout';
import { useSettings } from '@/store/settings/settings';
import { SecurityLevelPreference } from '@/store/settings/utils';
import { t } from '@lingui/macro';

import { CookieIcon, KeyholeIcon, SheetRef } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

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
    default:
      assertUnreachable(securityLevelPreference);
  }
}

export default function SettingsSecurityScreen() {
  const analyticsSheetRef = useRef<SheetRef>(null);
  const appAuthenticationSheetRef = useRef<SheetRef>(null);
  const settings = useSettings();

  return (
    <SettingsLayout
      title={t({
        id: 'security.header_title',
        message: 'Security',
      })}
    >
      <SettingsList>
        <SettingsListItem
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
        />
        <SettingsListItem
          title={t({
            id: 'security.app_auth.cell_title',
            message: 'App authentication',
          })}
          caption={getCaption(settings.securityLevelPreference)}
          icon={<KeyholeIcon />}
          onPress={() => {
            appAuthenticationSheetRef.current?.present();
          }}
        />
      </SettingsList>
      <AnalyticsSheet sheetRef={analyticsSheetRef} />
      <AppAuthenticationSheet sheetRef={appAuthenticationSheetRef} />
    </SettingsLayout>
  );
}
