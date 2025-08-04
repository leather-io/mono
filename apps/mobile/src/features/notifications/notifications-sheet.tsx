import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { Box, Button, Sheet, SheetRef, Text } from '@leather.io/ui/native';

export function NotificationsSheet({ sheetRef }: { sheetRef: RefObject<SheetRef | null> }) {
  const { themeDerivedFromThemePreference, changeNotificationsPreference } = useSettings();

  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box py="3" px="5" gap="5">
        <Text variant="heading03">{t`Receive transaction notifications`}</Text>
        <Text>{t`Enable to receive notifications about transactions`}</Text>
        <Box gap="3" py="3">
          <Button
            onPress={() => {
              changeNotificationsPreference('enabled');
              sheetRef.current?.dismiss();
            }}
            buttonState="default"
            title={t`Notify me`}
          />
          <Button
            onPress={() => {
              changeNotificationsPreference('disabled');
              sheetRef.current?.dismiss();
            }}
            buttonState="ghost"
            title={t`Don't notify me`}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
