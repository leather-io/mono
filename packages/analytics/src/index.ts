import { AnalyticsClientConfig, ExternalAnalyticsClientInterface } from 'types';

import { AnalyticsClient } from './client';

let analyticsClient: ReturnType<typeof AnalyticsClient<ExternalAnalyticsClientInterface>>;

/**
 * Configures the analytics client for the web environment. Must be called before any analytics functions are used.
 * @param {AnalyticsClientConfig} config - The configuration for the analytics client.
 * @returns {AnalyticsClient<AnalyticsClientInterface>} The configured analytics client.
 */
export function configureAnalyticsClient({ client, defaultProperties }: AnalyticsClientConfig) {
  analyticsClient = AnalyticsClient(client, { defaultProperties });

  return analyticsClient;
}

export { analyticsClient };
