import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletModal } from '@/components/add-wallet/add-wallet-modal';
import { ApproverModal } from '@/components/browser/approval-ux-modal';
import { BrowserMessage } from '@/components/browser/browser-in-use';
import { PressableListItem, TitleListItem } from '@/components/developer-console/list-items';
import { useToastContext } from '@/components/toast/toast-context';
import { APP_ROUTES } from '@/constants';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { router } from 'expo-router';

import { Box, Theme } from '@leather.io/ui/native';

export default function DeveloperConsoleScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const [getAddressesMessage, setGetAddressesMessage] = useState<BrowserMessage | null>(null);
  const addWalletModalRef = useRef<BottomSheetModal>(null);
  const toast = useToastContext();
  const {
    registerPushNotifications,
    _scheduleTestNotification,
    setNotificationReceivedListener,
    cleanupNotificationReceivedListener,
  } = usePushNotifications();

  useEffect(() => {
    setNotificationReceivedListener(notification => {
      const notificationText =
        notification.request.content.title ?? notification.request.content.body;
      if (notificationText) {
        toast.displayToast({
          title: notificationText,
          type: 'success',
        });
      }
    });
    return () => {
      cleanupNotificationReceivedListener();
    };
  }, []);
  return (
    <Box flex={1} backgroundColor="base.ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Box gap="2">
          <TitleListItem title={t`Open dummy page`} />
          <PressableListItem title={t`Drawer`} />
          <PressableListItem title={t`Page`} />
          <PressableListItem
            onPress={() => addWalletModalRef.current?.present()}
            title={t`Create wallet`}
          />
          <PressableListItem
            title="Wallet management"
            onPress={() => router.navigate(APP_ROUTES.WalletDeveloperConsoleWalletManager)}
          />
        </Box>
        <Box gap="2">
          <TitleListItem title={t`Trigger API presets`} />
          <PressableListItem
            title={t`getAddresses`}
            onPress={() =>
              setGetAddressesMessage({
                jsonrpc: '2.0',
                id: 'string',
                method: 'getAddresses',
              })
            }
          />
          <PressableListItem title="signMessage" />
          <PressableListItem title="transferBtc" />
          <PressableListItem title="signPsbt" />
          <PressableListItem title="stx_signTransaction" />
          <PressableListItem title="stx_signMessage" />
        </Box>
        <Box gap="2">
          <TitleListItem title={t`Trigger other functionality`} />
          <PressableListItem
            title={t`register for Push notifications`}
            onPress={registerPushNotifications}
          />
          <PressableListItem
            title={t`schedule dummy notifications in 3s`}
            onPress={() => _scheduleTestNotification(3)}
          />
        </Box>
      </ScrollView>
      <ApproverModal
        message={getAddressesMessage}
        sendResult={() => setGetAddressesMessage(null)}
      />
      <AddWalletModal addWalletModalRef={addWalletModalRef} />
    </Box>
  );
}
