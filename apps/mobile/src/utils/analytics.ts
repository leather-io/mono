import { store } from '@/store';
import { selectAnalyticsPreference } from '@/store/settings/settings.read';
import { AppLifecycleEventPlugin } from '@/utils/analytics-plugins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SegmentClient, createClient } from '@segment/analytics-react-native';

import { configureAnalyticsClient } from '@leather.io/analytics';

const FIRST_OPEN_KEY = 'first_open_tracked';

const segmentClient = createClient({
  writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
  trackAppLifecycleEvents: true,
  debug: false,
});

segmentClient.add({ plugin: new AppLifecycleEventPlugin() });

const leatherAnalyticsClient = configureAnalyticsClient<SegmentClient>({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});

export let analytics: ReturnType<typeof configureAnalyticsClient<SegmentClient>> | undefined =
  leatherAnalyticsClient;

export async function trackFirstAppOpen() {
  const hasTrackedFirstOpen = await AsyncStorage.getItem(FIRST_OPEN_KEY);

  if (!hasTrackedFirstOpen) {
    await analytics?.track('application_first_opened', {
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(FIRST_OPEN_KEY, 'true');
  }
}

store.subscribe(async () => {
  const analyticsPreference = selectAnalyticsPreference(store.getState());

  if (analyticsPreference === 'rejects-tracking') {
    await analytics?.track('user_setting_updated', {
      analytics: 'rejects-tracking',
    });
    analytics = undefined;
  } else {
    analytics = leatherAnalyticsClient;
  }
});
