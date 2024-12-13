import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Image } from 'expo-image';

import { Box, Button, Sheet, SheetRef, Text } from '@leather.io/ui/native';

export interface NotifyUserSheetData {
  title: string;
  id: string;
}

interface NotifyUserSheetLayoutProps {
  onCloseSheet?(): unknown;
  sheetData: NotifyUserSheetData | null;
  sheetRef: RefObject<SheetRef>;
}
export function NotifyUserSheetLayout({
  onCloseSheet,
  sheetData,
  sheetRef,
}: NotifyUserSheetLayoutProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  const { i18n } = useLingui();

  async function onNotify() {
    if (sheetData) {
      void analytics?.track('submit_feature_waitlist', {
        feature: sheetData.id,
      });
    }
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
          buttonState="default"
          title={t({
            id: 'notify_user.interested_button',
            message: "I'm interested",
          })}
        />
      </Box>
    </Sheet>
  );
}
