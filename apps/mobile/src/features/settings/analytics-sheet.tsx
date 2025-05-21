import { RefObject } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { useBrowser } from '@/core/browser-provider';
import { LEATHER_GUIDES_MOBILE_ANALYTICS } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { SheetRef } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface AnalyticsSheetProps {
  sheetRef: RefObject<SheetRef | null>;
}
export function AnalyticsSheet({ sheetRef }: AnalyticsSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { linkingRef } = useBrowser();

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
      sheetRef={sheetRef}
      title={t({
        id: 'analytics.header_title',
        message: 'Analytics',
      })}
      onPressSupport={() => linkingRef.current?.openURL(LEATHER_GUIDES_MOBILE_ANALYTICS)}
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
