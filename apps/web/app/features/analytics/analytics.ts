import { AnalyticsBrowser } from '@segment/analytics-next';

import { configureAnalyticsClient } from '@leather.io/analytics';
import { AnalyticsService } from '@leather.io/services';

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

export class WebAnalyticsService extends AnalyticsService {
  static readonly client = analytics;
}
