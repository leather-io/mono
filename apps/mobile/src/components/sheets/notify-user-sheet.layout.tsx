import { RefObject } from 'react';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  BellAlarmIcon,
  Box,
  Button,
  CloseIcon,
  Sheet,
  SheetRef,
  Text,
  Theme,
  TouchableOpacity,
  getButtonTextColor,
} from '@leather.io/ui/native';

export interface OptionData {
  title: string;
  id: string;
}

interface NotifyUserSheetProps {
  notifyUserSheetRef: RefObject<SheetRef>;
  optionData: OptionData | null;
  onCloseNotificationsSheet(): unknown;
}
export function NotifyUserSheet({
  notifyUserSheetRef,
  optionData,
  onCloseNotificationsSheet,
}: NotifyUserSheetProps) {
  const theme = useTheme<Theme>();
  const { registerPushNotifications } = usePushNotifications();
  async function onNotify() {
    await registerPushNotifications();
    notifyUserSheetRef.current?.dismiss();
  }
  const title = optionData?.title;
  const { theme: themeVariant } = useSettings();

  return (
    <Sheet
      themeVariant={themeVariant}
      onDismiss={onCloseNotificationsSheet}
      ref={notifyUserSheetRef}
    >
      <Box p="5" justifyContent="space-between" gap="5">
        <TouchableOpacity
          onPress={() => {
            notifyUserSheetRef.current?.close();
          }}
          p="5"
          right={0}
          top={0}
          zIndex={10}
          position="absolute"
        >
          <CloseIcon />
        </TouchableOpacity>
        <Box gap="4">
          <Text variant="heading05">{t`Notify me when ready`}</Text>
          <Text variant="body01">{t`"${title}" isn't ready yet.`}</Text>
        </Box>
        <Button
          onPress={onNotify}
          icon={<BellAlarmIcon color={theme.colors[getButtonTextColor('default')]} />}
          buttonState="default"
          title={t`Notify me when it's ready`}
        />
      </Box>
    </Sheet>
  );
}
