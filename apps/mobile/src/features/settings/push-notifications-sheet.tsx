import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Sheet, SheetRef, Text } from '@leather.io/ui/native';

interface PushNotificationsSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function PushNotificationsSheet({ sheetRef }: PushNotificationsSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Text>{t`Hello`}</Text>
    </Sheet>
  );
}
