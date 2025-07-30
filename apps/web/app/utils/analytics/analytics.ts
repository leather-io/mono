import { AnalyticsBrowser } from '@segment/analytics-next';

import { configureAnalyticsClient } from '@leather.io/analytics';

const segmentClient = new AnalyticsBrowser();

export const analytics = configureAnalyticsClient({
  client: segmentClient,
  defaultProperties: { platform: 'web' },
});

const writeKey = import.meta.env.LEATHER_SEGMENT_WRITE_KEY;

if (writeKey) {
  analytics.client.load(
    { writeKey },
    {
      integrations: {
        'Segment.io': {
          deliveryStrategy: {
            strategy: 'batching',
            config: {
              size: 10,
              timeout: 5000,
            },
          },
        },
      },
    }
  );
}
