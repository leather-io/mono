import { store } from '@/store';
import { selectAnalyticsPreference } from '@/store/settings/settings.read';
import { SegmentClient, createClient } from '@segment/analytics-react-native';

import { configureAnalyticsClient } from '@leather.io/analytics';

const segmentClient = createClient({
  writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
  trackAppLifecycleEvents: true,
  debug: false,
});

const leatherAnalyticsClient = configureAnalyticsClient<SegmentClient>({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});

export let analytics: ReturnType<typeof configureAnalyticsClient<SegmentClient>> | undefined =
  leatherAnalyticsClient;

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
