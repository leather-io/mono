import { RefObject } from 'react';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
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

export interface NotifyUserSheetData {
  title: string;
}

interface NotifyUserSheetProps {
  onCloseSheet?(): unknown;
  sheetData: NotifyUserSheetData | null;
  sheetRef: RefObject<SheetRef>;
}
export function NotifyUserSheet({ onCloseSheet, sheetData, sheetRef }: NotifyUserSheetProps) {
  const theme = useTheme<Theme>();
  const { themeDerivedFromThemePreference } = useSettings();
  const { registerPushNotifications } = usePushNotifications();
  const { i18n } = useLingui();

  async function onNotify() {
    await registerPushNotifications();
    sheetRef.current?.dismiss();
  }

  return (
    <Sheet themeVariant={themeDerivedFromThemePreference} onDismiss={onCloseSheet} ref={sheetRef}>
      <Image
        style={{ height: 180 }}
        contentFit="cover"
        source={require('@/assets/unavailable-feature.png')}
      />
      <Box p="5" justifyContent="space-between" gap="5">
        <Box gap="4">
          <Text variant="heading05">
            {i18n._({
              id: 'notify_user.title',
              message: '{title}',
              values: { title: sheetData?.title },
            })}
          </Text>
          <Text variant="body01">
            {t({
              id: 'notify_user.subtitle',
              message: `This feature is not available yet, but we can notify you when it’s ready.`,
            })}
          </Text>
        </Box>
        <Button
          onPress={onNotify}
          icon={<BellAlarmIcon color={theme.colors[getButtonTextColor('default')]} />}
          buttonState="default"
          title={t({
            id: 'notify_user.button',
            message: 'Notify me',
          })}
        />
      </Box>
    </Sheet>
  );
}
