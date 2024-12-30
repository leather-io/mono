import { RefObject } from 'react';
import { Linking } from 'react-native';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { GuideLinks } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { CookieIcon, SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AnalyticsSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AnalyticsSheet({ sheetRef }: AnalyticsSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onUpdateAnalytics() {
    settings.changeAnalyticsPreference(
      settings.analyticsPreference === 'consent-given' ? 'rejects-tracking' : 'consent-given'
    );
    displayToast({
      title: t({
        id: 'analytics.toast_title',
        message: 'Analytics updated',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      icon={<CookieIcon />}
      sheetRef={sheetRef}
      title={t({
        id: 'analytics.header_title',
        message: 'Analytics',
      })}
      onPressSupport={() => void Linking.openURL(GuideLinks.Analytics)}
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'analytics.cell_title',
            message: 'Allow collection of data',
          })}
          caption={t({
            id: 'analytics.cell_caption',
            message: 'Share anonymous usage details',
          })}
          type="switch"
          onSwitchValueChange={() => onUpdateAnalytics()}
          switchValue={settings.analyticsPreference === 'consent-given'}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
