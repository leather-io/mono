import { useRef } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { SettingsSheetLayout } from '@/features/settings/settings-sheet.layout';
import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';
import { setAlternateAppIcon } from 'expo-alternate-app-icons';
import { isError } from 'remeda';

import { SheetRef } from '@leather.io/ui/native';

import { AppIcon, appIcons, defaultAppIcon } from './app-icon.utils';
import { AppIcons } from './app-icons';

interface AppIconPickerSheetProps {
  sheetRef: SheetRef;
}

function mapIconNameToNative(icon: AppIcon): string | null {
  if (icon === 'default') return null;
  const iconNumber = icon.replace('icon-', '');
  // eslint-disable-next-line lingui/no-unlocalized-strings
  return `Icon${iconNumber}`;
}

export function AppIconPickerSheet({ sheetRef }: AppIconPickerSheetProps) {
  const { appIconPreference, changeAppIconPreference } = useSettings();
  const { displayToast } = useToastContext();
  const isChangingRef = useRef(false);

  const currentIcon = appIconPreference ?? defaultAppIcon;

  function handleSheetChange(index: number) {
    analytics.track(
      index > -1 ? 'app_icon_picker_sheet_opened' : 'app_icon_picker_sheet_dismissed'
    );
  }

  async function handleIconSelect(icon: AppIcon) {
    if (isChangingRef.current) return;
    if (icon === currentIcon) return;

    isChangingRef.current = true;
    const previousIcon = currentIcon;

    changeAppIconPreference(icon);
    analytics.track('app_icon_selected', { icon, previousIcon });

    try {
      const nativeIconName = mapIconNameToNative(icon);
      await setAlternateAppIcon(nativeIconName);
    } catch (error) {
      changeAppIconPreference(previousIcon);
      displayToast({
        title: t`Failed to change app icon`,
        type: 'error',
      });
      analytics.track('app_icon_change_failed', {
        icon,
        previousIcon,
        error: isError(error) ? error.message : undefined,
      });
    } finally {
      isChangingRef.current = false;
    }
  }

  return (
    <SettingsSheetLayout sheetRef={sheetRef} title={t`App Icon`} onChange={handleSheetChange}>
      <AppIcons currentIcon={currentIcon} setNewIcon={handleIconSelect} availableIcons={appIcons} />
    </SettingsSheetLayout>
  );
}
