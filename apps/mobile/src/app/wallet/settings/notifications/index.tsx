import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmailAddressSheet } from '@/features/settings/email-address-sheet';
import { EmailNotificationsSheet } from '@/features/settings/email-notifications-sheet';
import { PushNotificationsSheet } from '@/features/settings/push-notifications-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Box,
  Cell,
  EmailIcon,
  EmailNotificationIcon,
  SheetRef,
  SquareNotificationIcon,
  Theme,
} from '@leather.io/ui/native';

export default function SettingsNotificationsScreen() {
  const { bottom } = useSafeAreaInsets();
  const pushNotificationsSheetRef = useRef<SheetRef>(null);
  const emailNotificationsSheetRef = useRef<SheetRef>(null);
  const emailAddressSheetRef = useRef<SheetRef>(null);
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Cell
          title={t`Push notifications`}
          subtitle={t`All enabled`}
          Icon={SquareNotificationIcon}
          onPress={() => {
            pushNotificationsSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Email notifications`}
          subtitle={t`5 enabled`}
          Icon={EmailNotificationIcon}
          onPress={() => {
            emailNotificationsSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Email address`}
          subtitle={t`None/Awaiting verification/Verified`}
          Icon={EmailIcon}
          onPress={() => {
            emailAddressSheetRef.current?.present();
          }}
        />
      </ScrollView>
      <PushNotificationsSheet sheetRef={pushNotificationsSheetRef} />
      <EmailNotificationsSheet sheetRef={emailNotificationsSheetRef} />
      <EmailAddressSheet sheetRef={emailAddressSheetRef} />
    </Box>
  );
}
