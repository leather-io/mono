import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { LEATHER_GUIDES_MOBILE_ANALYTICS } from '@/shared/constants';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { SheetRef } from '@leather.io/ui/native';

import { useOpenUrl } from '../browser/browser/use-open-url';
import { SettingsSheetLayout } from './settings-sheet.layout';

interface AnalyticsSheetProps {
  sheetRef: SheetRef;
}
export function AnalyticsSheet({ sheetRef }: AnalyticsSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();
  const { openUrl } = useOpenUrl();

  function onUpdateAnalytics() {
    settings.changeAnalyticsPreference(
      settings.analyticsPreference === 'consent-given' ? 'rejects-tracking' : 'consent-given'
    );
    displayToast({
      title: t`Analytics updated`,
      type: 'success',
    });
  }

  return (
    <SettingsSheetLayout
      sheetRef={sheetRef}
      title={t`Analytics`}
      onPressSupport={() => openUrl(LEATHER_GUIDES_MOBILE_ANALYTICS)}
    >
      <SettingsList>
        <SettingsListItem
          title={t`Allow collection of data`}
          caption={t`Share anonymous usage details`}
          type="switch"
          onSwitchValueChange={() => onUpdateAnalytics()}
          switchValue={settings.analyticsPreference === 'consent-given'}
        />
      </SettingsList>
    </SettingsSheetLayout>
  );
}
