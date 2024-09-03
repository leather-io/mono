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
  const pushNotificationsModalRef = useRef<SheetRef>(null);
  const emailNotificationsRef = useRef<SheetRef>(null);
  const emailAddressModalRef = useRef<SheetRef>(null);
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
            pushNotificationsModalRef.current?.present();
          }}
        />
        <Cell
          title={t`Email notifications`}
          subtitle={t`5 enabled`}
          Icon={EmailNotificationIcon}
          onPress={() => {
            emailNotificationsRef.current?.present();
          }}
        />
        <Cell
          title={t`Email address`}
          subtitle={t`None/Awaiting verification/Verified`}
          Icon={EmailIcon}
          onPress={() => {
            emailAddressModalRef.current?.present();
          }}
        />
      </ScrollView>
      <PushNotificationsSheet sheetRef={pushNotificationsModalRef} />
      <EmailNotificationsSheet sheetRef={emailNotificationsRef} />
      <EmailAddressSheet sheetRef={emailAddressModalRef} />
    </Box>
  );
}
