import type { AnalyticsClient } from '@leather.io/analytics';

export abstract class AnalyticsService {
  static readonly client: ReturnType<typeof AnalyticsClient>;
}
