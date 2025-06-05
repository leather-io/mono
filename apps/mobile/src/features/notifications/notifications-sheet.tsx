import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';

import { Box, Button, Sheet, SheetRef, Text } from '@leather.io/ui/native';

export function NotificationsSheet({ sheetRef }: { sheetRef: SheetRef }) {
  const { changeNotificationsPreference } = useSettings();

  return (
    <Sheet ref={sheetRef}>
      <Sheet.View py="5" px="5" gap="5">
        <Text variant="heading03">{t`Receive transaction notifications`}</Text>
        <Text>{t`Enable to receive notifications about transactions`}</Text>
        <Box gap="3" py="3">
          <Button
            onPress={() => {
              changeNotificationsPreference('enabled');
              sheetRef.current?.dismiss();
            }}
          >
            {t`Notify me`}
          </Button>
          <Button
            onPress={() => {
              changeNotificationsPreference('disabled');
              sheetRef.current?.dismiss();
            }}
            variant="ghost"
          >
            {t`Don't notify me`}
          </Button>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
