import { RefObject } from 'react';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { Image } from 'expo-image';

import {
  BellAlarmIcon,
  Box,
  Button,
  Sheet,
  SheetRef,
  Text,
  Theme,
  getButtonTextColor,
} from '@leather.io/ui/native';

export interface OptionData {
  title: string;
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
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      themeVariant={themeDerivedFromThemePreference}
      onDismiss={onCloseNotificationsSheet}
      ref={notifyUserSheetRef}
    >
      <Image
        style={{ height: 180 }}
        contentFit="cover"
        source={require('@/assets/unavailable-feature.png')}
      />
      <Box p="5" justifyContent="space-between" gap="5">
        <Box gap="4">
          <Text variant="heading05">{title}</Text>
          <Text variant="body01">
            {t`This feature is not available yet, but we can notify when it’s ready.`}
          </Text>
        </Box>
        <Button
          onPress={onNotify}
          icon={<BellAlarmIcon color={theme.colors[getButtonTextColor('default')]} />}
          buttonState="default"
          title={t`Notify me`}
        />
      </Box>
    </Sheet>
  );
}
