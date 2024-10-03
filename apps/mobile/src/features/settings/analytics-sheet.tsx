import { RefObject } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Cell, CookieIcon, SheetRef } from '@leather.io/ui/native';

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
    >
      <Cell.Root
        title={t({
          id: 'analytics.cell_title',
          message: 'Allow collection of data',
        })}
        caption={t({
          id: 'analytics.cell_caption',
          message: 'Placeholder',
        })}
        onPress={() => onUpdateAnalytics()}
      >
        <Cell.Switch
          onValueChange={() => onUpdateAnalytics()}
          value={settings.analyticsPreference === 'consent-given'}
        />
      </Cell.Root>
    </SettingsSheetLayout>
  );
}
