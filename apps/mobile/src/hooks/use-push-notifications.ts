import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { t } from '@lingui/macro';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function _scheduleTestNotification(delaySeconds = 2) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: t`You've got mail! 📬`,
      body: t`Here is the notification body`,
      /* eslint-disable-next-line lingui/no-unlocalized-strings  */
      data: { data: 'goes here', test: { test1: 'more data' } },
    },
    trigger: { seconds: delaySeconds },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert(t`Failed to get push token for push notification!`);
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert(t`Must use physical device for Push Notifications`);
  }

  return token;
}

export function usePushNotifications() {
  const [, setExpoPushToken] = useState('');
  const [, setNotification] = useState<Notifications.Notification | undefined>(undefined);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerPushNotifications() {
    try {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token ?? '');
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  }

  function setNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => unknown
  ) {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      callback(notification);
    });
  }

  function cleanupNotificationReceivedListener() {
    notificationListener.current &&
      Notifications.removeNotificationSubscription(notificationListener.current);
    notificationListener.current = undefined;
  }

  function setNotificationInteractionListener(
    callback: (response: Notifications.NotificationResponse) => unknown
  ) {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      callback(response);
    });
  }

  function cleanupNotificationInteractionListener() {
    responseListener.current &&
      Notifications.removeNotificationSubscription(responseListener.current);
    responseListener.current = undefined;
  }

  function cleanupAllListeners() {
    cleanupNotificationReceivedListener();
    cleanupNotificationInteractionListener();
  }

  return {
    registerPushNotifications,
    _scheduleTestNotification,
    setNotificationReceivedListener,
    cleanupNotificationReceivedListener,
    setNotificationInteractionListener,
    cleanupNotificationInteractionListener,
    cleanupAllListeners,
  };
}
