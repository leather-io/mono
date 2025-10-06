import { store } from '@/store';
import { selectAnalyticsPreference } from '@/store/settings/settings.read';
import { AppLifecycleEventPlugin } from '@/utils/analytics-plugins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@segment/analytics-react-native';

import { configureAnalyticsClient } from '@leather.io/analytics';

import { getDeviceId } from './get-device-id';

const FIRST_OPEN_KEY = 'first_open_tracked';

const segmentClient = createClient({
  writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
  trackAppLifecycleEvents: true,
  debug: false,
});

segmentClient.add({ plugin: new AppLifecycleEventPlugin() });

async function identifyUserByDeviceId() {
  const id = await getDeviceId();
  if (id) {
    return analytics.identify(id);
  }
}
void identifyUserByDeviceId();

const analyticsClient = configureAnalyticsClient({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});

let analyticsEnabled = selectAnalyticsPreference(store.getState()) === 'consent-given';

function setupPreferenceSubscription() {
  return store.subscribe(() => {
    const analyticsPreference = selectAnalyticsPreference(store.getState());

    if (analyticsPreference === 'rejects-tracking') {
      analytics.track('user_setting_updated', { analytics: 'rejects-tracking' });
    }

    analyticsEnabled = analyticsPreference === 'consent-given';
  });
}

setupPreferenceSubscription();

export const analytics = new Proxy(analyticsClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (typeof value === 'function') {
      return (...args: unknown[]) => {
        if (!analyticsEnabled) return;
        return value.apply(target, args);
      };
    }

    return value;
  },
});

export async function trackFirstAppOpen() {
  const hasTrackedFirstOpen = await AsyncStorage.getItem(FIRST_OPEN_KEY);

  if (!hasTrackedFirstOpen) {
    await analytics.track('application_first_opened', {
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(FIRST_OPEN_KEY, 'true');
  }
}
