import { useSettings } from '@/store/settings/settings';
import { SegmentClient, createClient } from '@segment/analytics-react-native';

import { configureAnalyticsClient } from '@leather.io/analytics';

const segmentClient = createClient({
  writeKey: process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY || '',
  trackAppLifecycleEvents: true,
});

export const analytics = configureAnalyticsClient<SegmentClient>({
  client: segmentClient,
  defaultProperties: {
    platform: 'mobile',
  },
});
export function useAnalytics() {
  const { analyticsPreference } = useSettings();

  const isEnabled = analyticsPreference === 'consent-given';

  if (isEnabled) {
    return analytics;
  }
  return {
    ...analytics,
    track: () => {},
    page: () => {},
    identify: () => {},
    screen: () => {},
  };
}
