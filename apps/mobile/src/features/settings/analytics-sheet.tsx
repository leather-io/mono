import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { CookieIcon, ItemLayout, SheetRef, Switch, TouchableOpacity } from '@leather.io/ui/native';

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
    displayToast({ title: t`Analytics updated`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<CookieIcon />} sheetRef={sheetRef} title={t`Analytics`}>
      <TouchableOpacity onPress={() => onUpdateAnalytics()}>
        <ItemLayout
          actionIcon={<Switch disabled value={settings.analyticsPreference === 'consent-given'} />}
          captionLeft={t`Description`}
          titleLeft={t`Allow collection of data`}
        />
      </TouchableOpacity>
    </SettingsSheetLayout>
  );
}
