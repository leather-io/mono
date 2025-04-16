import { useCallback, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { useToastContext } from '@/components/toast/toast-context';
import { useNotificationsFlag } from '@/features/feature-flags';
import { useRegisterNotificationMutation } from '@/queries/notifications/notifications.query';
import { useBitcoinAddresses } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSignerAddresses } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { useWallets } from '@/store/wallets/wallets.read';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

interface RegisterNotifications {
  /**
   * Unregister FCM token. New notifications sent to this token would fail.
   * We should use this endpoint when user resets the app (deletes all wallets)
   *
   */
  unregisterNotifications(): Promise<void>;

  /** Registers notifications for BTC and STX addresses in our backend.
   *
   * /register endpoint is going to work as a sync for addresses connected to this device (across multiple wallets).
   * We need to call it when user:
   * 1.Adds an account
   * 2.Adds a wallet
   * 3.Deletes a wallet
   * 4. Toggles the notification setting
   *
   */
  registerNotifications(): Promise<void>;

  requestUserPermissions(): Promise<void>;

  registerNotificationsBtc(): Promise<void>;
  registerNotificationsStx(): Promise<void>;
  registerInAppNotifications(): void;
}

function useRegisterNotifications(): RegisterNotifications {
  const bitcoinAddresses = useBitcoinAddresses();
  const { mutateAsync: registerToken } = useRegisterNotificationMutation();
  const stacksAddresses = useStacksSignerAddresses();
  const { displayToast } = useToastContext();
  const releasePushNotifications = useNotificationsFlag();

  const registerNotificationsBtc = useCallback(async () => {
    const notificationToken = await messaging().getToken();
    await registerToken({ addresses: bitcoinAddresses, notificationToken, chain: 'bitcoin' });
  }, [registerToken, bitcoinAddresses]);

  const registerNotificationsStx = useCallback(async () => {
    const notificationToken = await messaging().getToken();

    await registerToken({ addresses: stacksAddresses, notificationToken, chain: 'stacks' });
  }, [registerToken, stacksAddresses]);

  const registerInAppNotifications = useCallback(() => {
    messaging().onMessage(remoteMessage => {
      if (remoteMessage.notification?.body) {
        displayToast({ title: remoteMessage.notification.body, type: 'success' });
      }
    });
  }, [displayToast]);

  const unregisterNotifications = useCallback(async () => {
    if (releasePushNotifications) {
      // Delete FCM token from Firebase
      await messaging().deleteToken();
    }
  }, [releasePushNotifications]);

  const requestUserPermissions = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      // TODO: analytics?
      if (finalStatus !== 'granted') {
        return;
      }
    }

    if (Platform.OS === 'android') {
      await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
    }
  }, []);

  const registerNotifications = useCallback(async () => {
    if (releasePushNotifications) {
      await registerNotificationsBtc();
      await registerNotificationsStx();
    }
  }, [registerNotificationsBtc, registerNotificationsStx, releasePushNotifications]);

  return {
    registerNotificationsBtc,
    registerNotificationsStx,
    registerNotifications,
    unregisterNotifications,
    requestUserPermissions,
    registerInAppNotifications,
  };
}

export function useWatchNotificationAddresses() {
  const btcAddresses = useBitcoinAddresses();
  const stacksAddresses = useStacksSignerAddresses();
  const releasePushNotifications = useNotificationsFlag();
  const { notificationsPreference } = useSettings();
  const {
    requestUserPermissions,
    registerNotificationsBtc,
    registerNotificationsStx,
    registerInAppNotifications,
    unregisterNotifications,
  } = useRegisterNotifications();

  useEffect(() => {
    if (releasePushNotifications && notificationsPreference === 'enabled') {
      void requestUserPermissions();
      registerInAppNotifications();
    }
  }, [
    releasePushNotifications,
    notificationsPreference,
    registerInAppNotifications,
    requestUserPermissions,
  ]);

  useEffect(() => {
    if (!releasePushNotifications) return;

    if (notificationsPreference === 'enabled') {
      void registerNotificationsBtc();
    }
    if (notificationsPreference === 'disabled') {
      void unregisterNotifications();
    }
  }, [
    btcAddresses,
    releasePushNotifications,
    notificationsPreference,
    registerNotificationsBtc,
    unregisterNotifications,
  ]);

  useEffect(() => {
    if (!releasePushNotifications) return;

    if (notificationsPreference === 'enabled') {
      void registerNotificationsStx();
    }
    if (notificationsPreference === 'disabled') {
      void unregisterNotifications();
    }
  }, [
    stacksAddresses,
    releasePushNotifications,
    notificationsPreference,
    registerNotificationsStx,
    unregisterNotifications,
  ]);
}

export function useOnDetectNoNotificationPreference(callback: undefined | (() => void)) {
  const { hasWallets } = useWallets();
  const { notificationsPreference } = useSettings();
  const releasePushNotifications = useNotificationsFlag();

  useEffect(() => {
    if (releasePushNotifications && hasWallets && notificationsPreference === 'not-selected') {
      callback?.();
    }
  }, [hasWallets, notificationsPreference, releasePushNotifications, callback]);
}
