import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletSheet } from '@/components/add-wallet/';
import { BrowserMessage } from '@/components/browser/browser-in-use';
import { PressableListItem } from '@/components/developer-console/list-items';
import { useToastContext } from '@/components/toast/toast-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { LOCALES } from '@/locales';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';
import { router } from 'expo-router';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

export default function DeveloperConsoleScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const { i18n } = useLingui();

  const [_, setGetAddressesMessage] = useState<BrowserMessage | null>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const toast = useToastContext();
  const {
    registerPushNotifications,
    _scheduleTestNotification,
    setNotificationReceivedListener,
    cleanupNotificationReceivedListener,
  } = usePushNotifications();

  const settings = useSettings();

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

  function toggleLocalization() {
    const locIdx = LOCALES.findIndex(loc => loc.locale === i18n.locale);
    const isLastItem = locIdx === LOCALES.length - 1;
    const nextIdx = isLastItem ? 0 : locIdx + 1;
    const nextLocale = LOCALES[nextIdx];
    if (!nextLocale) {
      throw new Error("Didn't find next locale for some reason");
    }
    i18n.activate(nextLocale.locale);
  }

  const locale = i18n.locale;

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[2],
        }}
      >
        <PressableListItem
          title={t`securityLevelPreference:` + ' ' + settings.securityLevelPreference}
        />
        <PressableListItem
          onPress={() => addWalletSheetRef.current?.present()}
          title={t`Create wallet`}
        />
        <PressableListItem
          title={t`Wallet management`}
          onPress={() => router.navigate(AppRoutes.DeveloperConsoleWalletManager)}
          testID={TestId.developerToolsWalletManagementButton}
        />
        <PressableListItem
          title={t`Bitcoin Scrach Pad`}
          onPress={() => router.navigate(AppRoutes.DeveloperBitcoinScratchPad)}
        />
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
        <PressableListItem
          title={t`register for Push notifications`}
          onPress={registerPushNotifications}
        />
        <PressableListItem
          title={t`schedule dummy notifications in 3s`}
          onPress={() => _scheduleTestNotification(3)}
        />
        <PressableListItem title={t`toggle localization: ${locale}`} onPress={toggleLocalization} />
        <PressableListItem title={t`signMessage`} />
        <PressableListItem title={t`transferBtc`} />
        <PressableListItem title={t`signPsbt`} />
        <PressableListItem title={t`stx_signTransaction`} />
        <PressableListItem title={t`stx_signMessage`} />
        <PressableListItem title={t`Drawer`} />
        <PressableListItem title={t`Page`} />
      </ScrollView>
      {/* TODO: this causes crash when trying to clear the store. */}
      {/* {wallets.list[0]?.fingerprint && ( */}
      {/*   <WalletLoader fingerprint={wallets.list[0].fingerprint}> */}
      {/*     {wallet => ( */}
      {/*       <ApproverSheet */}
      {/*         fingerprint={wallet.fingerprint} */}
      {/*         accountIndex={0} */}
      {/*         message={getAddressesMessage} */}
      {/*         sendResult={() => setGetAddressesMessage(null)} */}
      {/*       /> */}
      {/*     )} */}
      {/*   </WalletLoader> */}
      {/* )} */}
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </Box>
  );
}
