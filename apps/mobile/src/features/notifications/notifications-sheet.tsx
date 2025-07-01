import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Box, Button, Sheet, SheetRef, Text } from '@leather.io/ui/native';

export function NotificationsSheet({ sheetRef }: { sheetRef: RefObject<SheetRef | null> }) {
  const { themeDerivedFromThemePreference, changeNotificationsPreference } = useSettings();

  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box py="3" px="5" gap="5">
        <Text variant="heading03">
          {t({ id: 'notifications-sheet.title', message: 'Receive transaction notifications' })}
        </Text>
        <Text>
          {t({
            id: 'notifications-sheet.subtitle',
            message: 'Enable to receive notifications about transactions',
          })}
        </Text>
        <Box gap="3" py="3">
          <Button
            onPress={() => {
              changeNotificationsPreference('enabled');
              sheetRef.current?.dismiss();
            }}
            buttonState="default"
            title={t({
              id: 'notification-sheet.submit_button',
              message: `Notify me`,
            })}
          />
          <Button
            onPress={() => {
              changeNotificationsPreference('disabled');
              sheetRef.current?.dismiss();
            }}
            buttonState="ghost"
            title={t({
              id: 'notification-sheet.cancel_button',
              message: `Don't notify me`,
            })}
          />
        </Box>
      </Box>
    </Sheet>
  );
}
