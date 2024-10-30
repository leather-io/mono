import { createClient } from '@segment/analytics-react-native';

import { AnalyticsClientType, configureAnalyticsClient } from '@leather.io/analytics';

const segmentClient = createClient({
  writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
  trackAppLifecycleEvents: true,
});

export const analytics: AnalyticsClientType = configureAnalyticsClient({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});
