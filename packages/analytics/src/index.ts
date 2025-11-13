import { AnalyticsClient } from './client';
import { type AnalyticsClientConfig } from './types';

export * from './types';

export function configureAnalyticsClient(options: AnalyticsClientConfig) {
  return AnalyticsClient(options);
}
